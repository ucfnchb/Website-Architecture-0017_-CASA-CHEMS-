API_TOKEN_Mapbox = 'pk.eyJ1IjoidnNpZ25vIiwiYSI6ImNrc2IxcjV0ejAyNnQydXFxdG14Nnk4ZHcifQ.2YkWTQsNvu4cFyJWsHKSiw';

mapboxgl.accessToken = API_TOKEN_Mapbox;

//Initialize map view
const INITIAL_VIEW_STATE = {
    longitude: -0.1,
    latitude: 51.513526864426666,
    zoom: 10,
    bearing: 0,
    pitch: 0
};

//lowest level map display
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v10',
    interactive: true,
    center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
    zoom: INITIAL_VIEW_STATE.zoom,
    bearing: INITIAL_VIEW_STATE.bearing,
    pitch: INITIAL_VIEW_STATE.pitch,
    projection: 'mercator'
});
let hoveredPolygonId = null;

//Add a zoom button in the lower left corner
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

//Display map,add layer
map.on('load', () => {
    //Add individual tree layer
    map.addSource("individual-tree", {
        type: "geojson",
        data: './mapjson/individual-tree.geojson',
    });
    map.addLayer({
        'id': "individual-tree-layer",
        'type': "fill",
        'source': "individual-tree",
        'paint': {
            "fill-color": "#32CD32",
            'fill-outline-color': "#006400",
        }//Display geographic labels on all layers
    }, 'housenum-label');

    //Add area tree coverage layer
    map.addSource("area-tree", {
        type: "geojson",
        data: './mapjson/UK_canapy.geojson',
        'generateId': true
    });
    map.addLayer({
        'id': "area-tree-layer",
        'type': "fill",
        'source': 'area-tree',
        'paint': {
            //Fill different shades of colors based on tree coverage
            "fill-color": ["step", ["get", "percancov"],
                "#edf8e9", 5,
                "#c7e9c0", 10,
                "#a1d99b", 15,
                "#74c476", 20,
                "#41ab5d", 25,
                "#238b45", 30,
                "#005a32"
            ],
            'fill-outline-color': '#006400',
            //Change transparency on mouseover
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.1,
                0.9
            ]
        },//Display geographic labels on all layers
    }, 'housenum-label');

    //Add a highlight layer, which will not be displayed initially. After clicking with the mouse, fill the border to highlight the area.
    map.addLayer({
        'id': 'area-tree-layer-highlighted',
        'type': 'line',
        'source': 'area-tree',
        'paint': {
            "line-color": '#000000',
            'line-width': 3
        },//Find geojson
        'filter': ['in', 'wardcode', ''],
        'filter': ['in', 'wardname', '']
    }, 'housenum-label');

    
    //Map click event
    map.on('click', 'area-tree-layer', (e) => {
        var wardCode = e.features[0].properties.wardcode;
        
        //Build the popup text
        var description = ("Area Name: " + e.features[0].properties.wardname + '<br>' + "Coverage: " + Number(e.features[0].properties.percancov).toFixed(2) + " %" + '<br>' + "Survey Year: " + e.features[0].properties.survyear + '<br>' + "Ward Area: "+ Number(e.features[0].properties.warea).toFixed(2) + " m<sup>2</sup>" + '<br>');
        //console.log(description);

        const fieldValue = fetchWardData(wardCode, description);
        //console.log("FV:" + fieldValue);

        //Find the current area based on the mouse click position and display the highlighted layer
        //5px area around
        const bbox = [
            [e.point.x - 2, e.point.y - 2],
            [e.point.x + 2, e.point.y + 2]
        ];
        //Find geojson related features
        const selectedFeatures = map.queryRenderedFeatures(bbox, {
            layers: ['area-tree-layer']
        });
        const wardcode = selectedFeatures.map(
            (feature) => feature.properties.wardcode
        );
        //Filter, show highlight layer
        console.log(wardcode);
        map.setFilter('area-tree-layer-highlighted', ['in', 'wardcode', ...wardcode]);
        
        //Zoom to click area
        //Because the layer is a polygon composed of multiple longitude and latitude coordinates, need to reduce the coordinate array first, and then use fitBounds to jump to the area.
        var coordinates = e.features[0].geometry.coordinates[0];
        var bounds = coordinates.reduce(function (bounds, coord) {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        map.fitBounds(bounds, {
            padding: 20
        });

    });

    map.on('mouseenter', 'area-tree-layer', (e) => {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'area-tree-layer', () => {
        map.getCanvas().style.cursor = '';
    });
    //Make area transparent on mouseover
    map.on('mousemove', 'area-tree-layer', (e) => {
        if (e.features.length > 0) {
            if (hoveredPolygonId !== null) {
                map.setFeatureState({
                    source: 'area-tree',
                    id: hoveredPolygonId
                }, {
                    hover: false
                });
            }
            hoveredPolygonId = e.features[0].id;
            map.setFeatureState({
                source: 'area-tree',
                id: hoveredPolygonId
            }, {
                hover: true
            });
        }
    });
    // previously hovered feature.
    map.on('mouseleave', 'area-tree-layer', () => {
        if (hoveredPolygonId !== null) {
            map.setFeatureState({
                source: 'area-tree',
                id: hoveredPolygonId
            }, {
                hover: false
            });
        }
        hoveredPolygonId = null;
    });
});

//Add geocoder, search box
const geocoder = new MapboxGeocoder({
    // Initialize the geocoder
    accessToken: mapboxgl.accessToken,
    placeholder: 'Search for places',
    mapboxgl: mapboxgl, 
    marker: false
});

// Add the geocoder to the map
map.addControl(geocoder);

//Read geojson data and put into array for use in echarts
var x_data = [];
var y_data = [];
var all_data = [[],[]];
var all_wards = {};
var ward_coord = {};
//Read geojson
$.ajax({
    url: "./mapjson/UK_canapy.geojson",
    data: {},
    type: 'GET',
    success: function (data) {
        //Put into arrays
        for (var i = 0; i < data.features.length; i++) {
            x_data.push(data.features[i].properties.percancov);
            y_data.push(data.features[i].properties.wardname);
            all_wards[data.features[i].properties.wardname] = data.features[i].properties.wardcode;
            ward_coord[data.features[i].properties.wardname] = getCoords(data.features[i].geometry.coordinates);
        }
        displaylist(data);
    },
});

//just grab the first coord for the geometry
function getCoords(geom){
    var startChars = "-0123456789";
    var validChars = startChars + ", ";
    var geo = JSON.stringify(geom);
    var textLen = geo.length;
    var coords = "";
    var i = 0;

    
    while (i < textLen){
        i += 1;
        if (coords.length == 0) {
            //get first char
            if (startChars.includes(geo[i]) ){
                coords = geo[i];
            } //else do nothing
        } else{
            if (validChars.includes(geo[i])){
                coords += geo[i];
            }
            if (geo[i] == ']'){
                coords = "[" + coords + "]";
                return coords;
            }
        }
    } 
    return coords;
}

//using async function to display the data from the database when returned,
// otherwise execution continues before data is received
async function fetchWardData(wardCode, description) {
    
    try {
            const response = await fetch(`/getWardData?wardCode=${wardCode}`);
            //use await to process when node returns the data from the DB
            const data = await response.json();
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Continue with the data once it's available
            var dataFromDB = "";
            var pctgreen = 0.0;
            var pctblue = 0.0;
            //data is nested so need to iterate through it
            //create a stack to pop off each data record
            const stack = [{ obj: data, prefix: '' }];

            while (stack.length > 0) {
                //pop the next record  
                const { obj, prefix } = stack.pop();
        
                for (const key in obj) {
                    //if key is an object, it's not the actual record
                    if (typeof obj[key] === 'object') {
                        stack.push({ obj: obj[key], prefix: `${prefix}${key}.` });
                    } else {
                        const attributeName = `${key}`;
                        const attributeValue = obj[key];
                        //console.log(`Attribute Name: ${attributeName}, Attribute Value: ${attributeValue}`);
                        dataFromDB += attributeName + ": " + attributeValue + "<BR>";
                              if (attributeName == "% Blue")
                        {
                            pctblue = attributeValue;
                        }
                        if (attributeName == "% Green")
                        {
                            pctgreen = attributeValue;
                        }

                    }
                }
            }
            //if query returns no records, inform user
            if (dataFromDB.length == 0){  
                dataFromDB =  "<BR>Supplemental data not available for this ward";
            }
            //display area information after clicking
            document.getElementById("popup").innerHTML = description + '<div id="chart-container" style="height: 400px; width: 90%;"></div>'; //put the chart here 
            displayPopupChart(pctblue, pctgreen);
            return 1;

    } catch (error) {
        //if this errors, just show the data from the GeoJSON flat file
        document.getElementById("popup").innerHTML = description + "<BR>Supplemental data not available for this ward";  
        console.error('Error:', error);
        return 0;
    }
}
//Echarts bar chart
//information popup chart showing the %blue and %green coverage
function displayPopupChart(bluePercentage, greenPercentage) {
    var popupChart = echarts.init(document.getElementById('chart-container'));

    popupChart.setOption({
        tooltip: { 
            trigger: 'axis', 
            axisPointer: { type: 'shadow' } 
        },
        legend: { 
            data: ['Blue Coverage', 'Green Coverage'],
            bottom: 0 
        },
        grid: {
            left: '3%',
            right: '20%',
            bottom: '20%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['Coverage'],
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            max: 100 
        },
        series: [
            {
                name: 'Blue Coverage',
                type: 'bar',
                stack: 'total',
                label: { 
                    show: true,
                    position: 'right',
                    formatter: '{c} %',
                    fontSize: 10,  
                    color: '#000',  
                    distance: 10   
                },
                data: [bluePercentage]
            },
            {
                name: 'Green Coverage',
                type: 'bar',
                stack: 'total',
                label: { 
                    show: true,
                    position: 'right', 
                    formatter: '{c} %',
                    fontSize: 10,  
                    color: '#000',  
                    distance: 10  
                },
                data: [greenPercentage]
            }
        ]
    });
}

//Echarts bar chart
//bar chart showing tree cover for area
var displaychart = echarts.init(document.getElementById("barchart"));
function displaylist(data) {
    displaychart.setOption({
        title: {
            text: 'Tree Coverage List',
            x: 'center',
            y: 'top',
        },
        grid: {
            containLabel: true
        },
        xAxis: {
            type: 'value',
        },
        yAxis: {
            type: 'category',
            data: y_data,
        },
        visualMap: {
            orient: 'horizontal',
            left: 'center',
            min: 0,
            max: 60,
            text: ['High Coverage', 'Low Coverage'],
            dimension: 0,
            inRange: {
                color: ['#edf8e9', '#005a32']
            }
        },
        series: [{
            name: 'conapy',
            type: 'bar',
            data: x_data,
            sort:'descending',
        }],

        backgroundColor: '#f0f0f0',
        //Show scroll bars
        dataZoom: [{
                type: "slider",
                maxValueSpan: 20,
                show: true,
                yAxisIndex: [0],
            },
            {
                type: "inside", 
                yAxisIndex: [0],
                start: 0,
                end: 40,
                zoomOnMouseWheel: false, 
                moveOnMouseWheel: true, 
                moveOnMouseMove: true 
            }
        ],
    }, true);
}
//Click the bar to zoom to the area location
displaychart.on('click', function (params) {
    //Filter geojson data   
    var features = map.querySourceFeatures('area-tree', {
        sourceLayer: 'area-tree-layer',
        filter: ["==", 'wardname', params.name]
    });
  
    //if features undefined then zoom out and try again
    if (typeof features !== 'undefined'){
        //console.log("Zooming out to " + params.name);
        //zoom out first
        map.flyTo({center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude], essential: false, zoom:10});
 
        //Filter geojson data
        features = map.querySourceFeatures('area-tree', {
            sourceLayer: 'area-tree-layer',
            filter: ["==", 'wardname', params.name]
        });

        //if zooming out, clear the popup data
        document.getElementById("popup").innerHTML = "";
    }

    //Zoom to location
    var coordinates = features[0].geometry.coordinates[0];
    var bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.fitBounds(bounds, {
        padding: 20
    });
    
    //get ward code
    var wardCode = all_wards[params.name];

    //Show area information
    var description = ("Area name: " + features[0].properties.wardname + '<br>' + "Coverage: " + Number(features[0].properties.percancov).toFixed(2) + " %"+ '<br>' + "survyear: " +features[0].properties.survyear + '<br>' + "warea: "+ Number(features[0].properties.warea).toFixed(2) +" m<sup>2</sup>");
    
    document.getElementById("popup").innerHTML = description;
    map.setFilter('area-tree-layer-highlighted', ['in', 'wardname', params.name]);

    const fieldValue = fetchWardData(wardCode, description);
})

//When the mouse is hovering over bar, highlighted area on map
displaychart.on('mouseover',function(params){
    map.setFilter('area-tree-layer-highlighted', ['in', 'wardname', params.name]);
})

//button to hide the bar chart
function displaybarcharts() {
    var chartbox =document.getElementById("sidebarbox");
    var chart = document.getElementById("barchart111");
    var buttonimg = document.getElementById("hidebtn");
    // hide the bar chart
    if (chart.style.display === "none") {
        chart.style.display = "block";
        //Change button image
        buttonimg.src = "images/listbutton2.png";
        chartbox.style.height = "50%";
        //chartbox.style.height = "50px";
    } else {
        chart.style.display = "none";
        buttonimg.src = "images/listbutton1.png";
        chartbox.style.height = "50px";
    }
}


