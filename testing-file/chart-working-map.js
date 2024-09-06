

// Mapbox API TOKEN
const API_TOKEN_Mapbox = 'pk.eyJ1IjoidnNpZ25vIiwiYSI6ImNrc2IxcjV0ejAyNnQydXFxdG14Nnk4ZHcifQ.2YkWTQsNvu4cFyJWsHKSiw';
mapboxgl.accessToken = API_TOKEN_Mapbox;

// Initialize map view
const INITIAL_VIEW_STATE = {
    longitude: -0.1,
    latitude: 51.513526864426666,
    zoom: 10,
    bearing: 0,
    pitch: 0
};

// Create the map
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

// Add a zoom button in the lower left corner
map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');

// Load map and add layers
map.on('load', () => {
    // Add individual tree layer
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
        }
    }, 'housenum-label');

    // Add area tree coverage layer
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
	}
    }, 'housenum-label');

    // Add a highlight layer
    map.addLayer({
        'id': 'area-tree-layer-highlighted',
        'type': 'line',
        'source': 'area-tree',
        'paint': {
            "line-color": '#000000',
            'line-width': 3
        },
	'filter': ['in', 'wardcode', ''],
        'filter': ['in', 'wardname', '']
    }, 'housenum-label');

    // Map click event
    map.on('click', 'area-tree-layer', (e) => {
        var feature = e.features[0];
        var description = ("Area name: " + feature.properties.wardname + '<br>' +
                           "Coverage: " + feature.properties.percancov + " %" + '<br>' +
                           "Survey Year: " + feature.properties.survyear + '<br>' +
                           "Ward Area: " + feature.properties.warea + " m<sup>2</sup>");

        document.getElementById("popup").innerHTML = description + '<div id="chart-container" style="height: 300px; width: 100%;"></div>';

        displaySidebarChart(feature);

        var coordinates = feature.geometry.coordinates[0];
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

// Add geocoder, search box
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    placeholder: 'Search for places',
    mapboxgl: mapboxgl,
    marker: false
});

map.addControl(geocoder);

// Read geojson data and put into array for use in echarts
var x_data = [];
var y_data = [];
var blue_percentage = [];
var green_percentage = [];

// AJAX call to load GeoJSON data
$.ajax({
    url: "./mapjson/UK_canapy.geojson",
    data: {},
    type: 'GET',
    success: function (data) {
        for (var i = 0; i < data.features.length; i++) {
            x_data.push(data.features[i].properties.percancov);
            y_data.push(data.features[i].properties.wardname);
            blue_percentage.push(data.features[i].properties["% Blue"]);
            green_percentage.push(data.features[i].properties["% Green"]);
        }
	displaylist(data);
    },
});

// Function to initialize the stacked bar chart in the sidebar
function displaySidebarChart(feature) {
    var sidebarChart = echarts.init(document.getElementById('chart-container'));

    var bluePercentage = feature.properties["% Blue"] || 0;
    var greenPercentage = feature.properties["% Green"] || 0;

    sidebarChart.setOption({
        title: {
            text: 'Blue and Green Coverage Percentages',
            x: 'center'
        },
	tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
	legend: {
            data: ['Blue Percentage', 'Green Percentage'],
            bottom: 0
        },
	grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
	xAxis: {
            type: 'category',
            data: [feature.properties.wardname],
            axisTick: { show: false }
        },
	yAxis: {
            type: 'value',
            max: 100  // Percentage should be within 0-100
        },
	series: [
            {
             	name: 'Blue Percentage',
                type: 'bar',
                stack: 'coverage',
                label: { show: true },
                data: [bluePercentage]
            },
            {
             	name: 'Green Percentage',
                type: 'bar',
                stack: 'coverage',
                label: { show: true },
                data: [greenPercentage]
            }
	]
    });
}

// Echarts bar chart
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
            text: ['High', 'Low'],
            dimension: 0,
            inRange: {
                color: ['#edf8e9', '#005a32']
            }
	},
	series: [{
            name: 'conapy',
            type: 'bar',
            data: x_data,
            sort: 'descending',
        }],
	backgroundColor: '#f0f0f0',
        dataZoom: [{
            type: "slider",
            maxValueSpan: 20,
            show: true,
            yAxisIndex: [0],
        }, {
            type: "inside",
            yAxisIndex: [0],
            start: 0,
            end: 40,
            zoomOnMouseWheel: false,
            moveOnMouseWheel: true,
            moveOnMouseMove: true
        }],
    }, true);
}

// Click the bar to zoom to the area location
displaychart.on('click', function (params) {
    var wardName = params.name;

    var feature = map.querySourceFeatures('area-tree', {
        sourceLayer: 'area-tree-layer',
        filter: ["==", 'wardname', wardName]
    })[0];

    var description = ("Area name: " + feature.properties.wardname + '<br>' +
                       "Coverage: " + feature.properties.percancov + " %" + '<br>' +
                       "Survey Year: " + feature.properties.survyear + '<br>' +
                       "Ward Area: " + feature.properties.warea + " m<sup>2</sup>");

    document.getElementById("popup").innerHTML = description + '<div id="chart-container" style="height: 300px; width: 100%;"></div>';

    displaySidebarChart(feature);

    map.flyTo({
        center: [-0.1, 51.5],
        zoom: 9,
        speed: 4,
    });

    setTimeout(function() { zommtoarea(params); }, 1000);
});

// Highlight area on map when hovering over bar chart
displaychart.on('mouseover', function(params) {
    map.setFilter('area-tree-layer-highlighted', ['in', 'wardname', params.name]);
});

function zommtoarea(params) {
    var features = map.querySourceFeatures('area-tree', {
        sourceLayer: 'area-tree-layer',
        filter: ["==", 'wardname', params.name]
    });

    var coordinates = features[0].geometry.coordinates[0];
    var bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    map.fitBounds(bounds, {
        padding: 20
    });

    var description = ("Area name: " + features[0].properties.wardname + '<br>' +
                       "Coverage: " + features[0].properties.percancov + " %" + '<br>' +
                       "Survey Year: " + features[0].properties.survyear + '<br>' +
                       "Ward Area: " + features[0].properties.warea + " m<sup>2</sup>");
    document.getElementById("popup").innerHTML = description;
    map.setFilter('area-tree-layer-highlighted', ['in', 'wardname', params.name]);
}

// Button to hide the bar chart
function displaybarcharts() {
    var chartbox = document.getElementById("sidebarbox");
    var chart = document.getElementById("barchart111");
    var buttonimg = document.getElementById("hidebtn");

    if (chart.style.display === "none") {
        chart.style.display = "block";
        buttonimg.src = "images/listbutton2.png";
        chartbox.style.height = "50%";
    } else {
	chart.style.display = "none";
        buttonimg.src = "images/listbutton1.png";
        chartbox.style.height = "50px";
    }
}







