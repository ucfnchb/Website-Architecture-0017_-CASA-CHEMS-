//Mapbox API TOKEN
const API_TOKEN_Mapbox = 'pk.eyJ1IjoidnNpZ25vIiwiYSI6ImNrc2IxcjV0ejAyNnQydXFxdG14Nnk4ZHcifQ.2YkWTQsNvu4cFyJWsHKSiw';
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
    style: 'mapbox://styles/mapbox/streets-v9',
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
        //Display area information after clicking
        var description = ("Area name: " + e.features[0].properties.wardname + '<br>' + "Coverage: " + e.features[0].properties.percancov + " %" + '<br>' + "survyear: " + e.features[0].properties.survyear + '<br>' + "warea: "+e.features[0].properties.warea+" m<sup>2</sup>");
        document.getElementById("popup").innerHTML = description;

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
        }
        displaylist(data);
    },
});





//Echarts bar chart
//bar chart showing tree cover for area
var displaychart = echarts.init(document.getElementById("barchart"));
function displaylist(data) {
    displaychart.setOption({
        title: {
            text: 'Tree coverage list',
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
    //Zoom to location
    var coordinates = features[0].geometry.coordinates[0];
    var bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.fitBounds(bounds, {
        padding: 20
    });
    //Show area information
    var description = ("Area name: " + features[0].properties.wardname + '<br>' + "Coverage: " + features[0].properties.percancov + " %"+ '<br>' + "survyear: " +features[0].properties.survyear + '<br>' + "warea: "+features[0].properties.warea+" m<sup>2</sup>");
    document.getElementById("popup").innerHTML = description;
    map.setFilter('area-tree-layer-highlighted', ['in', 'wardname', params.name]);
})
//When the mouse is hovering over bar, highlighted area on map
displaychart.on('mouseover',function(params){
    map.setFilter('area-tree-layer-highlighted', ['in', 'wardname', params.name]);
})
//button to hide the bar chart
function displaybarcharts() {
    var chart = document.getElementById("barchart111");
    var buttonimg = document.getElementById("hidebtn");
    // hide the bar chart
    if (chart.style.display === "none") {
        chart.style.display = "block";
        //Change button image
        buttonimg.src = "images/listbutton2.png";
    } else {
        chart.style.display = "none";
        buttonimg.src = "images/listbutton1.png";
    }
}


