
/*
 * Map - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- the actual data
 */

Map = function(_parentElement, _data, _mapType){
    this.parentElement = _parentElement;
    this.data = _data;
    this.mapType = _mapType;
    this.filteredData = this.data;

    this.initVis();
}


/*
 * Initialize map visualization (static content, e.g. SVG area or axes)
 */

Map.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 20, right: 0, bottom: 200, left: 140};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // vis.width = 1100 - margin.left - margin.right,
    //     vis.height = 800 - margin.top - margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Define map projection
    if (vis.mapType === 'world') {
        vis.projection = d3.geoMercator()
            .scale(120)
            .center([-50, 50])
            .translate([vis.width/5, vis.height / 2]);
    } else {
        vis.projection = d3.geoAlbersUsa()
            .scale(700)
            // .center([-50, 50])
            .translate([vis.width/5, vis.height / 2]);
    }

    // Set path
    vis.path = d3.geoPath()
        .projection(vis.projection);

    // Load in GeoJSON data
    vis.loadGeoJson();
}

Map.prototype.loadGeoJson = function() {
    var vis = this;

    if (vis.mapType === 'world') {
        d3.json("data/world-110m.json", function(worldJson) {
            vis.mapData = topojson.feature(worldJson, worldJson.objects.countries).features;
            vis.wrangleData()
        });
    } else {
        d3.json("data/us-states.json", function(usJson) {
            vis.mapData = usJson.features;
            vis.wrangleData()
        });
    }

}

Map.prototype.wrangleData = function() {
    var vis = this;

    vis.updateVis();
}

Map.prototype.updateVis = function() {
    var vis = this;

    console.log(vis.mapData);
    var map = vis.svg.selectAll('path')
        .data(vis.mapData);

    map.enter().append('path')
        .merge(map)
        .attr('d', vis.path)
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
}
