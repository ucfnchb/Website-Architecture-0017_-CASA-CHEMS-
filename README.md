# Website-Architecture-0017_-CASA-CHEMS-


## Map page
The website map is displayed using Map page.html, map.js and map.css. 
### Top navigation bar
The top of the map page is a responsive navigation bar made with <ul>
```
  <ul class="topbar">
    <!-- Website name -->
    <li style="float:left"><a href="#Lnading" class="lia" style="font-size: 22px;"><strong>CHEMS-London Tree Canopy</strong></a></li>
    <!-- Page jump button drop-down -->
    <li style="float:right" class="dropdown">
      <a class="lia" href="javascript:void(0)" class="dropbtn"><i class="fa fa-bars"></i></a>
      <div class="dropdown-content">
        <a class="lia" href="index.html">Map</a>
        <a class="lia" href="insights.html">Insights</a>
      </div>
    </li>
    <!-- Page jump button -->
    <li class="Topbutton" style="float:right"><a href="insights.html"><img class="topbtmimg" src="images/Insightsbtn.png" alt=""></a></li>
    <li class="Topbutton" style="float:right"><a href="index.html"><img class="topbtmimg" src="images/Mapbtm.png" alt=""></a></li>
  </ul>
```
### Map and data layer display
The website uses mapbox to output the map to the map div, and displays three layers in map.on('load', individual-tree layer, area-tree layer and area-tree-highlighted layer.
```
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
```
### click event
After the user clicks on the area-tree-layer area, the code in map.on('click') will identify the currently clicked area. Data information, read the information and output it to the html div "popup" for display. At the same time, the highlighted layer will draw the boundaries of the same polygon. Make it look prominent. and zoom to that area.
```
 map.on('click', 'area-tree-layer', (e) => {
        //Display area information after clicking
        var description = ("Area name: " + e.features[0].properties.wardname + '<br>' + "Coverage: " + e.features[0].properties.percancov + " %" + '<br>' + "survyear: " + e.features[0].properties.survyear + '<br>' + "warea: "+e.features[0].properties.warea+" m<sup>2</sup>");
        document.getElementById("popup").innerHTML = description;
    });
```
### Hovers event
map.on(mouse) is used to set the opacity of an area to 0 when the mouse is over it, and restore it when you leave it, so you can see the streets and individual trees layers at the bottom.
```
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
```
### Bar chart
Create bar chart to visualize tree cover data. Here we use echarts to create a bar chart and output it to the barchart div of html. The data reads local geojson data through $.ajax, then pushes it into the y_data and x_data arrays, and then outputs these two arrays to xAxis and yAxis in displaychart.setOption.
```
var displaychart = echarts.init(document.getElementById("barchart"));
function displaylist(data) {
    displaychart.setOption({
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
            sort:'descending',
        }],
```
### 
After the bar chart bar is clicked, displaychart.on('click') reads the clicked data, uses querySourceFeatures to search for features in the area-tree-layer, and then uses the same fitBounds as on the mapbox. Zoom to the location of the anchor area. At the same time, the regional data information is read and output to the html div pop-up window. Additionally, a highlight layer is also used to highlight the relevant area when the mouse is hovered over the bar.
```
displaychart.on('click', function (params) {
    //Filter geojson data
    map.flyTo({
        center: [-0.1,51.5],
        zoom: 9,
        speed: 4, 
     });

     setTimeout(function() { zommtoarea(params); }, 1000);
})
//When the mouse is hovering over bar, highlighted area on map
displaychart.on('mouseover',function(params){
    map.setFilter('area-tree-layer-highlighted', ['in', 'wardname', params.name]);
})
```
## Insight Page
The Insights web page, designed to raise awareness about the importance of tree canopy coverage, features a detailed structure and design focusing on the environmental benefits of trees. Its primary sections include:

- Tree Benefits: Highlighting the numerous advantages trees offer, like air quality improvement and biodiversity enhancement. Interactive elements allow users to explore detailed information.
- Why it Matters: Discussing the critical role of tree canopy in urban areas, focusing on its multifaceted impacts.
- Case Study: Featuring a real-world example from Camden Borough, emphasizing the benefits of green spaces on mental health, supported by testimonials and links to external research.
- References: Providing credible sources for further exploration, with downloadable resources.
- Contact: Enabling user engagement and feedback.
### CSS style
The webpage's CSS style, csstest.css, ensures a clean, modern look with a dark green color scheme and responsive design, enhancing readability and user experience. The layout uses flex containers for balanced presentation, and images are designed to be responsive, maintaining aspect ratios.
