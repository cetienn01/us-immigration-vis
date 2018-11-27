/*
 * CountryTrendLine - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

CountryTrendLine = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
}

/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

CountryTrendLine.prototype.initVis = function(){
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
        .call(vis.xAxis);


    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.countryline = d3.line()
        .x(function(d) {
            return vis.x(d.year); })
        .y(function(d) { return vis.y(d.approvals); })
        .curve(d3.curveCatmullRom.alpha(0.5));


    // (Filter, aggregate, modify data)
    vis.wrangleData();


}


/*
 * Data wrangling
 */

CountryTrendLine.prototype.wrangleData = function(){
    var vis = this;

    vis.updateVis(vis.data);

}

/*
 * The drawing function
 */

CountryTrendLine.prototype.updateVis = function(data){
    var vis = this;

    console.log(data)

    var formatDate = d3.timeFormat("%Y");

    /*vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d){
                return formatDate(d.year) + 'Acceptances: ' + d.approvals;
        })
        .offset([0,0]);

    vis.svg.call(vis.tip); */


    vis.x.domain(d3.extent(data, function(d) {
        return d.year;
    }));

    vis.y.domain([0, d3.max(data, function(d) {
        return d.approvals;
    })]);

    var line= vis.svg.selectAll(".line")
        .data(data);

        line.enter().append("path")
            .attr("class", "line")

            .merge(line)
            .transition()
            .duration(1000)
            .attr("d", vis.countryline(data))
            .attr("fill", "none")
            .style("stroke", "#810f7c");


        line.exit().remove();


    // Call axis functions with the new domain

    vis.svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(vis.yAxis);

    vis.svg.select(".x-axis")
        .transition()
        .duration(1000)
        .call(vis.xAxis);


}
