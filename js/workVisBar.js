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

    vis.margin = { top: 20, right: 100, bottom: 20, left: 50 };

    vis.width = 400 - vis.margin.left - vis.margin.right,
        vis.height = 150 - vis.margin.top - vis.margin.bottom;


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
        .padding(0.3);


    vis.yAxis = d3.axisLeft()
        .scale(vis.y)

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis")
        .attr("transform", "translate(" + vis.margin.left + ", 0)");

    //add title to each bar chart
    vis.svg.append("text")
        .style("font-weight","bold")
        .attr("class", "bar-title")
        .attr("x", vis.margin.left)
        .attr("y", -5)
        .text(vis.config.title);


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}

/*
 * Data wrangling
 */

BarChart.prototype.wrangleData = function(){
    var vis = this;

    // (1) Group data by key variable (e.g. 'electricity') and count leaves
    // (2) Sort columns descending

    //get all keys
    var keys = Object.keys(vis.data[0]);
    keys.forEach(function(key,index){   //remove year
        if(key=="year"){
            keys.splice(index,1);
        }
    })

    var counts = d3.nest().rollup(function(d){
        var totals = {};

        keys.forEach(function(key,index){
            totals[key] = d3.sum(d, function (v) {return v[key];});
        });
        return totals;
    }).entries(vis.data)

    //console.log(counts);

    //convert counts to array of objects
    var countsNew = Object.keys(counts).map(key => ({key:key,value:counts[key]}));

    countsNew.sort(function(a, b) {
        return b.value - a.value;
    });

    console.log(countsNew);

    //vis.configCounts = configCounts;

    //console.log(configCounts)

    // Update the visualization
    //vis.updateVis();
}



