/*
 * AreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'data for total number of visas by year.'
 */

AreaChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
}

/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

AreaChart.prototype.initVis = function(){
    var vis = this;

    // * TO-DO *
    vis.margin = { top: 40, right: 60, bottom: 60, left: 60 };

    vis.width = 500 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis
            .tickFormat(d3.timeFormat("%Y")));


    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) {return vis.x(d.key);})
        .y0(vis.height)
        .y1(function(d) { return vis.y(d.value);});

    //Initialize brush component
    vis.brush = d3.brushX()
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush", brushed);

    // (Filter, aggregate, modify data)
    vis.wrangleData();

}


/*
 * Data wrangling
 */

AreaChart.prototype.wrangleData = function(){
    var vis = this;

    var approvalCounts = d3.nest()
        .key(function(d) {return d.year;})
        .rollup(function(v){ return v[0].Approvals})
        .entries(vis.data);

    //nest convert to string, convert key to date object
    approvalCounts.forEach(function(d) {
        d.key = parseYear(d.key);
    })

    vis.displayData = approvalCounts;

    vis.updateVis();

}

/*
 * The drawing function
 */

AreaChart.prototype.updateVis = function(){
    var vis = this;

    //console.log(vis.displayData);

    vis.x.domain(d3.extent(vis.displayData, function(d) {
        return d.key;
    }));

    vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d.value;
    })]);

    var areaChart=vis.svg.append("path")
        .datum(vis.displayData)
        .attr("class", "area")
        .attr("fill", "var(--main-color)")
        .attr("d", vis.area);

    //title
    vis.svg.append("text")
        .attr("x", vis.width/2 )
        .attr("y", 0)
        .style("font-weight","bold")
        .style("text-anchor", "middle")
        .text("USCIS H-1B Approvals (2007-2017)");

    //x-axis title
    vis.svg.append("text")
        .attr("x", vis.width/2 )
        .attr("y", vis.height + 40)
        .style("text-anchor", "middle")
        .style("font-size","12px")
        .text("Year");

    //y-axis title
    vis.svg.append("text")
        .attr("x", -vis.height/2 )
        .attr("y", -vis.margin.left+9)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .style("font-size","12px")
        .text("Number of Approvals");

    //exit remove
    areaChart.exit().remove();


    //Append brush component here
    vis.svg.append("g")
        .attr("class", "x brush")
        .call(vis.brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", vis.height + 7);

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

}
