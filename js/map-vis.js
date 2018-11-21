
/*
 * Map - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- the actual data
 * @param _mapData			-- An objection containing TopoJSON data for drawing the maps, and country names
 */

Map = function(_parentElement, _data, _mapData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.mapData = _mapData;
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

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Define map projection
    if (vis.mapData.mapType === 'world') {
        vis.projection = d3.geoMercator()
            .scale(100)
            .center([-40, 60])
            .translate([vis.width/4, vis.height/2]);
    } else {
        vis.projection = d3.geoAlbersUsa()
            .scale(700)
            // .center([-50, 50])
            .translate([vis.width/2.5, vis.height/1.5]);
    }

    // Set path
    vis.path = d3.geoPath()
        .projection(vis.projection);

    vis.drawMap();
}

Map.prototype.drawMap = function() {
    var vis = this;
    var map;

    if(vis.mapData.mapType === 'world') {
        map = topojson.feature(vis.mapData.map, vis.mapData.map.objects.countries).features;
        
        // Map country names to geoJSON country data
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < vis.mapData.names.length; j++) {
                if (map[i].id === +vis.mapData.names[j].id) {
                    map[i].country = vis.mapData.names[j].name;
                }
            }
        }

        // Map data
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < vis.data.length; j++) {
                if (map[i].country === vis.data[j].key) {
                    vis.data[j].values.forEach(function(year) {
                        var permanentRes = (typeof year.values[0] === 'undefined') ? 0 : year.values[0].number;
                        var naturalized = (typeof year.values[1] === 'undefined') ? 0 : year.values[1].number;
                        year.totalImmigration = permanentRes + naturalized;
                    })
                    map[i].properties = vis.data[j].values;
                }
            }
        }
    } else {
        // US State names are already included in this data set
        map = vis.mapData.map.features;
    }

    vis.mapData = map;

    vis.updateVis();
}

Map.prototype.updateVis = function() {
    var vis = this;
    // console.log(vis.data);

    var map = vis.svg.selectAll('path')
        .data(vis.mapData);

    map.enter().append('path')
        .merge(map)
        .attr('d', vis.path)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style('fill', function(d) {
            // console.log(d.properties);
        });
}

Map.prototype.filterData = function() {
    console.log('filter');
}
