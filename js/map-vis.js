
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
    this.mapType = _mapData.mapType;
    this.filteredData = _data[0];
    this.legendDrawn = false; // Tracks if the legend has already been drawn
    this.currentlyDisplayedVisaType = 'H-1B' // Tracks which visa type is currently displayed for world map

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
    vis.svg = d3.select("#" + vis.parentElement).append('svg')
        .attr('class', 'map-svg')
        .attr('width', vis.width + vis.margin.left + vis.margin.right)
        .attr('height', vis.height + vis.margin.top + vis.margin.bottom)
        .call(d3.zoom().on('zoom', function () {
            vis.svg.attr('transform', d3.event.transform);
        }))
        .append('g')
        .attr('transform', 'translate(' + vis.margin.left + ',' + vis.margin.top + ')')

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
    var colorSelection = colorbrewer.YlGnBu[9];

    vis.color = d3.scaleThreshold()
        .domain([10,50,100,500,1000,5000,10000,50000,100000])
        .range(colorSelection);

    vis.drawMap();
}

Map.prototype.drawMap = function() {
    var vis = this;
    var map, h1bMap, h2aMap, h2bMap;
    var datasetCount = (vis.mapType === 'world' ? vis.data.length - 1 : vis.data.length);

    if (vis.mapData.mapType === 'world') {
        map = topojson.feature(vis.mapData.map, vis.mapData.map.objects.countries).features;
        vis.countryOrState = 'Country';

        // Map country names to geoJSON country data
        for (var i = 0; i < map.length; i++) {
            for (var j = 0; j < vis.mapData.names.length; j++) {
                if (map[i].id === +vis.mapData.names[j].id) {
                    map[i].Country = vis.mapData.names[j].name;
                    var countryInfo = vis.data[3].filter(function(info) { return info.Country.trim() === vis.mapData.names[j].name; });
                    if (countryInfo.length > 0) {
                        map[i].Population = countryInfo[0].Population;
                        map[i].Area = countryInfo[0].Area + ' (sq. mi.)';
                        map[i]['Pop. Density'] = countryInfo[0]['Pop. Density'] + ' (per sq. mi.)';
                        map[i]['Net migration'] = countryInfo[0]['Net migration'];
                        map[i].GDP = '$' + countryInfo[0].GDP + ' (per capita)';
                        map[i].Literacy = countryInfo[0].Literacy + '%';
                    }
                }
            }
        }
    } else {
        // US State names are already included in this data set
        map = vis.mapData.map.features;
        vis.countryOrState = 'State';
    }

    // Convert data to numeric values
    for (var i = 0; i < datasetCount; i++) {
        for (var j = 0; j < vis.data[i].length; j++) {
            var columnCount = (vis.data[i].columns.indexOf('Region') >= 0 ? (vis.data[i].columns.length - 1) : vis.data[i].columns.length)
            for (var k = 1; k < columnCount; k++) {
                vis.data[i][j][vis.data[i].columns[k]] = parseInt(vis.data[i][j][vis.data[i].columns[k]].replace(/,/g, ''));
            }
        }
    }

    if (datasetCount > 1) {
        h1bMap = map.map(a => Object.assign({}, a));
        h2aMap = map.map(b => Object.assign({}, b));
        h2bMap = map.map(c => Object.assign({}, c));

        vis.h1bMap = vis.combineDataWithGeojson(h1bMap, 0);
        vis.h2aMap = vis.combineDataWithGeojson(h2aMap, 1);
        vis.h2bMap = vis.combineDataWithGeojson(h2bMap, 2);
        vis.filteredData = vis.h1bMap;
    } else {
        vis.filteredData = vis.combineDataWithGeojson(map, 0);
    }

    vis.updateVis();
}

Map.prototype.combineDataWithGeojson = function(map, dataIndex) {
    var vis = this;
    // Map visa data, and general country info to properties field of geojson data
    for (var i = 0; i < map.length; i++) {
        for (var j = 0; j < vis.data[dataIndex].length; j++) {
            var countryName1 = map[i][vis.countryOrState];
            var countryName2 = vis.data[dataIndex][j][vis.countryOrState];
            if (countryName1 === countryName2) {
                map[i].properties = vis.data[dataIndex][j];
            }
        }
    }
    return map;
}

Map.prototype.filterData = function(visaType) {
    var vis = this;
    if (visaType === 'H-1B') {
        vis.filteredData = vis.h1bMap;
    } else if (visaType === 'H-2A') {
        vis.filteredData = vis.h2aMap;
    } else if (visaType === 'H-2B') {
        vis.filteredData = vis.h2bMap;
    }
    vis.updateVis();
}

Map.prototype.updateVis = function() {
    var vis = this;
    var currentSelection = vis.getCurrentYearSelection();
    var detailsElement = (vis.mapType === 'world' ? '#world_map_details_area' : '#states_details_area');

    // Clear details element
    $(detailsElement).empty();

    var text;
    if (vis.mapType === 'world') {
        text = 'Work Visas: ';
    } else {
        text = 'H-1B Certified: ';
    }

    // create tooltips
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .style('pointer-events', 'none !important')
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

    // Update map
    var map = vis.svg.selectAll('path')
        .data(vis.filteredData);

    map.enter().append('path')
        .merge(map)
        .attr('class', 'map-path')
        .attr('d', vis.path)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style('fill', function(d) {
            return vis.setFillColor(d);
        })
        .style('stroke', "var(--background-color)")
        .on('mouseover', function(d, i) {
            d3.select(this)
                .style('stroke', 'black')
                .style('opacity', 0.5)
                .style('cursor', 'pointer');
            vis.tip.show(d, i);
        })
        .on('mouseout', function(d, i) { 
            d3.select(this)
                .style('stroke', 'white')
                .style('opacity', 1)
            vis.tip.hide(d, i);
        })
        .on('click', function(d) {
            var currentColor = (d.properties[currentSelection] ? vis.color(d.properties[currentSelection]) : '#aaa');
            var introParagraph = $('[data-anchor="section2"] .section_paragraph');
            if (introParagraph) {
                introParagraph.hide();
            }
            vis.svg.selectAll('path').style('fill', '#e4e4e4')
            d3.select(this).style('fill', currentColor);
            vis.drawDetails(d, currentSelection);

            // Register outside click event, restores fill colors of maps
            vis.svg.select(function() {
                return this.parentNode;
            }).on('click', function() {
                var clickedTarget = d3.event.target;
                var clickedClass = $(clickedTarget).attr('class');
                if (clickedClass === 'map-svg') {
                    vis.svg.selectAll('path.map-path').style('fill', function(d) {
                        return vis.setFillColor(d);
                    })
                }
            });
        });


    // Draw legend only if it does not exist
    if (!vis.legendDrawn) {
        vis.drawLegend();
    }

    // Pass selected country into drawDetails function to draw barchart and display country info
    // On initial page load, set world map to show data for India and US map to show California
    if (vis.selected) {
        var selected = vis.filteredData.filter(function(item) { return item.Country === vis.selected.Country });
        vis.drawDetails(selected[0], currentSelection);
    } else {
        var index = (vis.mapType === 'world' ? 73 : 4);
        vis.drawDetails(vis.filteredData[index], currentSelection);
    }
}

// Define select box based on map type
Map.prototype.getCurrentYearSelection = function() {
    var vis = this;
    if (vis.mapType === 'world') {
        return d3.select('#world-map-selection').property('value');
    } else {
        return d3.select('#us-map-selection').property('value');
    }
}


Map.prototype.setFillColor = function(d) {
    var vis = this;
    var currentSelection = vis.getCurrentYearSelection();
    if (d.properties[vis.countryOrState]) {
        return vis.color(d.properties[currentSelection]);
    } else {
        return '#BDBDBD';
    }
}

Map.prototype.drawLegend = function() {
    var vis = this;
    vis.legendDrawn = true;

    var legend = vis.svg.append('g')
        .attr('class', 'legendQuant')
        .attr('transform', 'translate(' + -vis.margin.left/1.1 + ',' + vis.height*1.05 + ')');

    legend.append('text')
        .attr('class', 'caption')
        .attr('x', 0)
        .attr('y', -10)
        .attr('font-size', 15)
        .text('Number of People Migrating');

    legend = d3.legendColor()
        .labels(function({i, genLength, generatedLabels,labelDelimiter}) {
            if (i === 0) {
                const values = generatedLabels[i].split(`${labelDelimiter}`)
                return `0 to ${values[1]}`
              } 
              return generatedLabels[i];
        })
        .labelFormat(d3.format('.0f'))
        .shapeWidth(15)
        .shapePadding(5)
        .shapeHeight(15)
        .scale(vis.color);

    vis.svg.select('.legendQuant')
        .call(legend);
}

Map.prototype.drawDetails = function(d, currentSelection) {
    var vis = this;
    var element = (vis.mapType === 'world' ? '#' + vis.parentElement + '_details' : '#states_details_area');
    vis.selected = d;

    $(element).empty();

    vis.detailsWidth = $(element).width() - vis.margin.left - vis.margin.right;

    if (vis.mapType != 'world') {

        // SVG country details area
        vis.detailsSvg = d3.select(element).append("svg")
            .attr("width", vis.detailsWidth + vis.margin.left + vis.margin.right)
            .attr("height", 370)
            .append("g")
            .attr("transform", "translate(35, 50)");


    // Check if data is available for selected country
    // Display barchart if data is available, otherwise display 'no data' message
    var sumOfValues = Object.values(d.properties).reduce(function(a, b) { return a + b; }, 0);
    if (Object.keys(d.properties).length === 0) {
        vis.detailsSvg.append('text')
            .attr('x', 0)
            .attr('y', -10)
            .text('Data is not available for ' + d.Country + ' in ' + currentSelection)
            .call(wrap, 300);
    } else if (sumOfValues === 0 || sumOfValues.startsWith('0')) {
        vis.detailsSvg.append('text')
            .attr('x', 0)
            .attr('y', -10)
            .text('No ' + vis.currentlyDisplayedVisaType + ' visas were issued for ' + d.Country + ' in ' + currentSelection)
            .call(wrap, 300);;
    } else {
        vis.drawDetailBarCharts(d, currentSelection);
    }

    }

    else {
        vis.drawDetailBarCharts(d, currentSelection);
    }
}

Map.prototype.drawDetailBarCharts = function(d, currentSelection) {
    var vis = this;
    var keys, values;

    if (vis.mapType != 'world') {
        // Title: Name of country or state
        vis.detailsSvg.append('text')
            .attr('class', 'location-label')
            .attr('x', 20)
            .attr('y', -10)
            .text(d[vis.countryOrState]);
    }

    // reformat data, if Region is included in data then ignore it
    if (Object.keys(d.properties).indexOf('Region') >= 0) {
        keys = Object.keys(d.properties).slice(0, -2);
        values = Object.values(d.properties).slice(0, -2);
    } else {
        keys = Object.keys(d.properties).slice(0, -1);
        values = Object.values(d.properties).slice(0, -1);
    }

    var detailsData = [];

    for (var i = 0; i < keys.length; i++) {
        var obj = { 'year': keys[i], 'value': values[i] };
        detailsData.push(obj);
    }

    // Scales for bar chart
    var y = d3.scaleBand()
        .domain(keys)
        .range([vis.height, 0])
        .padding(0.1);

    var x = d3.scaleLinear()
        .domain([0, d3.max(detailsData, function(d){ return d.value; })])
        .range([0, vis.detailsWidth]);

    // Add bars

    if (vis.mapType != 'world') {
        vis.detailsSvg.selectAll('rect')
            .data(detailsData)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('width', function (d) {
                return x(d.value);
            })
            .attr('y', function (d) {
                return y(d.year);
            })
            .attr('height', y.bandwidth())
            .style('fill', function (d) {
                return d.year === currentSelection ? 'var(--main-color)' : '#ccc';
            });

        // add the x Axis
        vis.detailsSvg.append('g')
            .attr('transform', 'translate(0,' + vis.height + ')')
            .call(d3.axisBottom(x)
                .ticks(5));


        // add the y Axis
        vis.detailsSvg.append('g')
            .call(d3.axisLeft(y));
    }

    // Country General Information
    if (vis.mapType === 'world') {
        console.log('hello')
        var countryInfoDiv = document.createElement('div')
        $(countryInfoDiv).append('<div class="map_bubble">'+'Population: ' + (numberWithCommas(d.Population) || 'Unknown') + '</div>');
        $(countryInfoDiv).append('<div class="map_bubble">'+'Area: ' + numberWithCommas(d.Area) + '</div>');
        $('#world_map_area_details').append(countryInfoDiv);

        var countryInfoDiv2 = document.createElement('div')
        $(countryInfoDiv2).append('<div class="map_bubble">'+'Population Density: '+ '<br>' + d['Pop. Density'] + '</div>');
        $(countryInfoDiv2).append('<div class="map_bubble">'+'Net Migration: ' + d['Net migration'] + '</div>');
        $('#world_map_area_details').append(countryInfoDiv2);

        var countryInfoDiv3 = document.createElement('div')
        $(countryInfoDiv3).append('<div class="map_bubble">'+'GDP: '+ '<br>'+  numberWithCommas(d.GDP) + '</div>');
        $(countryInfoDiv3).append('<div class="map_bubble">'+'Literacy: '+ '<br>' + d.Literacy + '</div>');
        $('#world_map_area_details').append(countryInfoDiv3);
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Function for wrapping long labels from Mike Bostock:  https://bl.ocks.org/mbostock/7555321
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.3, // ems
            x = text.attr('x'),
            y = text.attr('y'),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                .append('tspan')
                .attr('x', x)
                .attr('y', y)
                .attr('dy', dy + 'em');
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];
                tspan = text.append('tspan')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                    .text(word);
            }
        }
    });
}
