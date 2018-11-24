
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
    this.mapType = _mapData.mapType;

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
    if (vis.mapType === 'world') {
        vis.projection = d3.geoMercator()
            .scale(110)
            .center([-40, 60])
            .translate([vis.width/4, vis.height/2]);
    } else {
        vis.projection = d3.geoAlbersUsa()
            .scale(700)
            .translate([vis.width/2.5, vis.height/1.5]);
    }

    // Set path
    vis.path = d3.geoPath()
        .projection(vis.projection);

    // Set color scale
    var colorSelection = (vis.mapType === 'world' ? colorbrewer.PuOr[5] : colorbrewer.YlGnBu[5])
    vis.color = d3.scaleQuantize()
        .range(colorSelection);

    vis.drawMap();
}

Map.prototype.drawMap = function() {
    var vis = this;
    var map;

    if(vis.mapData.mapType === 'world') {
        map = topojson.feature(vis.mapData.map, vis.mapData.map.objects.countries).features;
        vis.countryOrState = 'Country';
        
        // Map country names to geoJSON country data
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < vis.mapData.names.length; j++) {
                if (map[i].id === +vis.mapData.names[j].id) {
                    map[i].Country = vis.mapData.names[j].name;
                }
            }
        }
    } else {
        // US State names are already included in this data set
        map = vis.mapData.map.features;
        vis.countryOrState = 'State';
    }

    // Convert data to numeric values
    for (var i = 0; i < vis.data.length; i++) {
        for (var j = 1; j < vis.data.columns.length; j++) {
            vis.data[i][vis.data.columns[j]] = parseInt(vis.data[i][vis.data.columns[j]].replace(/,/g, ''));
        }
    }

    // Map visa data to properties field of geojson data
    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < vis.data.length; j++) {
            var properties;
            if (map[i][vis.countryOrState] === vis.data[j][vis.countryOrState]) {
                map[i].properties = vis.data[j];
            }
        }
    }

    vis.mapData = map;

    vis.updateVis();
}

Map.prototype.updateVis = function() {
    var vis = this;
    var currentSelection;

    if (vis.mapType === 'world') {
        currentSelection = d3.select('#world-map-selection').property('value');
    } else {
        currentSelection = d3.select('#us-map-selection').property('value');
    }

    vis.color
        .domain([
            d3.min(vis.mapData, function(d) { return d.properties[currentSelection]; }),
            d3.max(vis.mapData, function(d) { return d.properties[currentSelection]; })
        ]);

    var text;
    if (vis.mapType === 'world') {
        text = 'Work Visas: ';
    } else {
        text = 'Immigrants: ';
    }

    // create tooltips
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d){
            if (d.properties[vis.countryOrState]) {
                return d.properties[vis.countryOrState] + '<br>'
                    + text + (d.properties[currentSelection]);
            } else {
                return 'No Data Available';
            }
        })
        .offset([0,0]);

    vis.svg.call(vis.tip)

    var map = vis.svg.selectAll('path')
        .data(vis.mapData);

    map.enter().append('path')
        .merge(map)
        .attr('d', vis.path)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style('fill', function(d) {
            if (d.properties[vis.countryOrState]) {
                return vis.color(d.properties[currentSelection]);
            } else {
                return '#ccc';
            }
        })
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide);

    vis.drawLegend();
}

Map.prototype.filterData = function() {
    var vis = this;
    vis.updateVis();
}

Map.prototype.drawLegend = function() {
    var vis = this;

    var legend = vis.svg.append('g')
        .attr('class', 'legendQuant')
        .attr('transform', 'translate(' + vis.width / 1.4 + ',' + vis.height * 1.2 + ')');

    legend.append('text')
        .attr('class', 'caption')
        .attr('x', 0)
        .attr('y', -20)
        .attr('font-size', 15)
        .text('Scale');

    legend = d3.legendColor()
        .labelFormat(d3.format('.0f'))
        .shapeWidth(15)
        .shapePadding(5)
        .shapeHeight(15)
        .scale(vis.color);

    vis.svg.select('.legendQuant')
        .call(legend);
}
