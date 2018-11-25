//barchart constructor
BarChart = function(_parentElement, _data, _config){
    this.parentElement = _parentElement;
    this.data = _data;
    this.config = _config;
    this.displayData = _data;

    this.initVis();
}

BarChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 20, right: 200, bottom: 50, left: 170 };

    vis.width = 500 - vis.margin.left - vis.margin.right,
        vis.height = 200 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0,vis.width])

    vis.y = d3.scaleBand()
        .rangeRound([0,vis.height])
        .padding(0.1);

    // add the x Axis
    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate("+vis.margin.left+"," + vis.height + ")");

    //add the y Axis
    vis.yAxis = d3.axisLeft()
        .scale(vis.y)

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis_bar axis")
        .attr("transform", "translate(" + vis.margin.left + ", 0)");

    //add title to each bar chart
    vis.svg.append("text")
        .style("font-weight","bold")
        .style("font-size","14px")
        .attr("class", "bar-title")
        .attr("x", vis.margin.left)
        .attr("y", -5)
        .text(vis.config);


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}

/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function() {
    var vis = this;

    // (1) Group data by key variable (e.g. 'electricity') and count leaves
    // (2) Sort columns descending

    //get all keys
    var keys = Object.keys(vis.data[0]);
    keys.forEach(function (key, index) {   //remove year
        if (key == "year") {
            keys.splice(index, 1);
        }
    })

    var counts = d3.nest().rollup(function (d) {
        var totals = {};

        keys.forEach(function (key, index) {
            totals[key] = d3.sum(d, function (v) {
                return v[key];
            });
        });
        return totals;
    }).entries(vis.displayData)

    //console.log(counts);

    //convert counts to array of objects
    var countsNew = Object.keys(counts).map(key => ({key: key, value: counts[key]}));

    countsNew.sort(function (a, b) {
        return b.value - a.value;
    });

    //console.log(countsNew);

    if (countsNew.length >= 15) {
        vis.counts = countsNew.slice(0, 15);    //get top15, if needed
    } else {
        vis.counts = countsNew;
    }

    // Update the visualization
    vis.updateVis();
}

BarChart.prototype.updateVis = function(){
    var vis = this;

    //console.log(vis.counts);

    // (1) Update domains
    vis.x.domain([0, vis.counts[0].value]);  //first element should be the highest => sorted!
    vis.y.domain(vis.counts.map(function(d) {return d.key;}));


    // (2) Draw rectangles
    var rect = vis.svg.selectAll("rect")
        .data(vis.counts);

    // Enter (initialize the newly added elements)
    rect.enter().append("rect")
        .attr("class", "bar");

    rect
        .attr("fill", "#4C4C4C")
        .attr("x", vis.margin.left)
        .attr("y", function(d) {
            return vis.y(d.key);
        })
        .attr("width", function(d) {
            return vis.x(d.value);
        })
        .attr("height", vis.y.bandwidth());

    //Exit
    rect.exit().remove();


    // Update the x-axis
    vis.svg.select(".x-axis")
        .call(vis.xAxis
            .ticks(5))
        .selectAll("text")
        .style("text-anchor", "end")
        .style("font-size","8px")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    //update y-axis
    vis.svg.select(".y-axis_bar").call(vis.yAxis);
}


/*
 * Filter data when the user changes the selection
 * Example for brushRegion: 07/16/2016 to 07/28/2016
 */

BarChart.prototype.selectionChanged = function(brushRegion){
    var vis = this;

    // Filter data accordingly without changing the original data
    vis.displayData = vis.data.filter(function(d) {
        return (parseYear(d.year) >= brushRegion[0] & parseYear(d.year) <= brushRegion[1]);
    });


    // Update the visualization
    vis.wrangleData();
}



