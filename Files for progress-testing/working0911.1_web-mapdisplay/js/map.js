//mapbox taken
const API_TOKEN_Mapbox = 'pk.eyJ1IjoidnNpZ25vIiwiYSI6ImNrc2IxcjV0ejAyNnQydXFxdG14Nnk4ZHcifQ.2YkWTQsNvu4cFyJWsHKSiw';

mapboxgl.accessToken = API_TOKEN_Mapbox;

//底部地图的设定51.513526864426666, -0.1271890523690548
const INITIAL_VIEW_STATE = {
    //covent garden - 51.5120483,-0.1254003
    longitude: -0.1254003,
    latitude: 51.5120483,
    zoom: 10,
    bearing: 0,
    pitch: 0
};

//MapBox Vector Tile
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    //style: 'mapbox://styles/chacehhh123/cloocclet00g901qm8yhj5m6q',
    interactive: true,
    center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
    zoom: INITIAL_VIEW_STATE.zoom,
    bearing: INITIAL_VIEW_STATE.bearing,
    pitch: INITIAL_VIEW_STATE.pitch,
    projection: 'mercator'
});
let hoveredPolygonId = null;
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

//display map,add layer
map.on('load', () => {

    var layers = map.getStyle().layers;
    // Find the index of the first symbol layer in the map style
    var firstSymbolId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'Place-labels') {
            firstSymbolId = layers[i].id;
            break;
        }
    }

    //individual tree layer
    map.addSource("individual-tree", {
        type: "geojson",
        data: './mapjson/CIR2016_2km_25cm_tile_354_mercator.geojson',
    });

    map.addLayer({
        'id': "individual-tree-layer",
        'type': "fill",
        'source': "individual-tree",
        'paint': {
            "fill-color": "#32CD32",
            'fill-outline-color': "#006400",
        }
    }, 'housenum-label');

    //Area tree coverage layer
    map.addSource("area-tree", {
        type: "geojson",
        data: './mapjson/London_Ward_Canopy_Cover.geojson',
        'generateId': true
    });


    map.addLayer({
        'id': "area-tree-layer",
        'type': "fill",
        'source': 'area-tree',
        'paint': {
            // "fill-color": "#0000ff",
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
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.1,
                0.9
            ]
        },
        //}, firstSymbolId);
    }, 'housenum-label');


    map.addLayer({
        'id': 'area-tree-layer-highlighted',
        'type': 'line',
        'source': 'area-tree',
        'paint': {
            "line-color": '#000000',
            'line-width': 3
        },
        'filter': ['in', 'wardcode', '']
        //}, firstSymbolId);
    }, 'housenum-label');


    map.on('click', 'area-tree-layer', (e) => {


        console.log(e.features[0].properties.wardcode);    
        console.log(e.features[0].properties.percancov);  
        
        //const wardCode = $`{e.feature[0].properties.wardcode}`;
        const wardCode = e.features[0].properties.wardcode;
        console.log("WC: " + wardCode);

        // Send the GET request to the server
        fetch(`/getSQLData?wardCode=${wardCode}`)
            .then(response => response.json())
            .then(data => {
                console.log("ret: ");
                console.log(data);
            });

        var description = ("Area name: " + e.features[0].properties.wardname + '<br>' + "Coverage: " + e.features[0].properties.percancov + " Borough:" + data);
        document.getElementById("popup").innerHTML = description;    
        //
        const bbox = [
            [e.point.x - 2, e.point.y - 2],
            [e.point.x + 2, e.point.y + 2]
        ];
        const selectedFeatures = map.queryRenderedFeatures(bbox, {
            layers: ['area-tree-layer']
        });
        const wardcode = selectedFeatures.map(
            (feature) => feature.properties.wardcode
        );
        console.log(wardcode);
        map.setFilter('area-tree-layer-highlighted', ['in', 'wardcode', ...wardcode]);

    });

    map.on('mouseenter', 'area-tree-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'area-tree-layer', () => {
        map.getCanvas().style.cursor = '';
    });

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

const geocoder = new MapboxGeocoder({
    // Initialize the geocoder
    accessToken: mapboxgl.accessToken, // Set the access token
    placeholder: 'Search for places',
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: false // Do not use the default marker style
});



// Add the geocoder to the map
map.addControl(geocoder);

var x_data = [];
var y_data = [];
var all_data = [];

$.ajax({
    url: "./mapjson/UK_Ward_Canopy_Cover.geojson",
    data: {},
    type: 'GET',
    success: function (data) {


        for (var i = 0; i < 250; i++) {
            x_data.push(data.features[i].properties.percancov);
            y_data.push(data.features[i].properties.wardname);
        }


        displaylist(data);
    },
});

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
        //grid: {
        //     left: 100
        // },
        xAxis: {
            type: 'value',
            //data:x_data
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
            // Map the score column to color
            dimension: 0,
            inRange: {
                color: ['#edf8e9', '#005a32']
            }
        },
        series: [{
            name: 'conapy',
            type: 'bar',
            // encode: {
            //   x: 'percancov',
            //   y: 'wardname'
            // }
            data: x_data,
            sort: 'descending'
        }],

        backgroundColor: '#f0f0f0',
        dataZoom: [{
                type: "slider",
                maxValueSpan: 15,
                show: true,
                yAxisIndex: [0],
            },
            {
                type: "inside", // 支持内部鼠标滚动平移
                yAxisIndex: [0],
                start: 0,
                end: 40,
                zoomOnMouseWheel: false, // 关闭滚轮缩放
                moveOnMouseWheel: true, // 开启滚轮平移
                moveOnMouseMove: true // 鼠标移动能触发数据窗口平移 
            }
        ],
    }, true);
}
displaychart.on('click', function (params) {
    //console.log(params.name)
    // map.on('style.load', function() {
    var features = map.querySourceFeatures('area-tree', {
        sourceLayer: 'area-tree-layer',
        filter: ["==", 'wardname', params.name]
    });
    //console.log(features);

    var coordinates = features[0].geometry.coordinates[0];
    var bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.fitBounds(bounds, {
        padding: 20
    });
    //console.log(bounds);

    var description = ("Area name: " + features[0].properties.wardname + '<br>' + "Coverage: " + features[0].properties.percancov + " %");
    document.getElementById("popup").innerHTML = description;


    // const bbox = [
    //     [e.point.x - 5, e.point.y - 5],
    //     [e.point.x + 5, e.point.y + 5]
    // ];
    // const selectedFeatures = map.queryRenderedFeatures(bbox, {
    //     layers: ['area-tree-layer']
    // });
    // const wardcode = selectedFeatures.map(
    //     (feature) => feature.properties.wardcode
    // );
    const wardcode = features[0].properties.wardcode;
    console.log(wardcode);
    map.setFilter('area-tree-layer-highlighted', ['in', 'wardcode', wardcode]);


})

function displaybarcharts() {
    var chart = document.getElementById("barchart111");
    var buttonimg = document.getElementById("hidebtn");

    if (chart.style.display === "none") {
        chart.style.display = "block";
        buttonimg.src = "img/listbutton2.png";
    } else {
        chart.style.display = "none";
        buttonimg.src = "img/listbutton1.png";
    }
}