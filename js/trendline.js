/*
 * TrendLine - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

TrendLine = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
}

/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

TrendLine.prototype.initVis = function(){
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

    vis.approvalsline = d3.line()
        .x(function(d) { return vis.x(d.year); })
        .y(function(d) { return vis.y(d.Approvals); })
        .curve(d3.curveCatmullRom.alpha(0.5));

    vis.applicationsline = d3.line()
        .x(function(d) { return vis.x(d.year); })
        .y(function(d) { return vis.y(d.Receipts); })
        .curve(d3.curveCatmullRom.alpha(0.5));

    // (Filter, aggregate, modify data)
    vis.wrangleData();


}


/*
 * Data wrangling
 */

TrendLine.prototype.wrangleData = function(){
    var vis = this;

    vis.data.sort(function(a, b) { return a.year - b.year; });

    vis.data.forEach(function(d){
        d.year=+d.year;
    })
/*

       var approvalCounts = d3.nest()
           .key(function(d) {return d.year;})
           .rollup(function(v){ return v[0].Approvals})
           .entries(vis.data);

       //nest convert to string, convert key to date object
       approvalCounts.forEach(function(d) {
           d.key = parseYear(d.key);
       })

       vis.displayData = approvalCounts; */



    vis.updateVis();

}

/*
 * The drawing function
 */

TrendLine.prototype.updateVis = function(){
    var vis = this;

    console.log(vis.data)

    vis.x.domain(d3.extent(vis.data, function(d) {
        return d.year;
    }));

    vis.y.domain([0, d3.max(vis.data, function(d) {
        return d.Receipts;
    })]);

    vis.svg.append("path")
        .data(vis.data)
        .attr("class", "line")
        .attr("fill", "none")
        .style("stroke", "#810f7c")
        .attr("d", vis.applicationsline(vis.data));

    vis.svg.append("path")
        .data(vis.data)
        .attr("class", "line")
        .attr("fill", "none")
        .style("stroke", "#810f7c")
        .attr("d", vis.approvalsline(vis.data));


    /*
    var lines= vis.svg.selectAll("line")
        .data(vis.data)

        lines.enter().append("path")
            .attr("class", "line")

            .merge(lines)
            .transition()
            .duration(1000)
            .attr("d", vis.applicationsline (vis.data));

    lines.exit().remove(); */

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);


}
