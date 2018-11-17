

/*
CODE FROM OLD BARCHART FILE

 * timelineChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

timelineChart = function(_parentElement, _data, _config){
    this.parentElement = _parentElement;
    this.data = _data;
    this.config = _config;
    this.displayData = _data;

    this.initVis();
}



/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

timelineChart.prototype.initVis = function(){
    var vis = this;

    //margins and sizing
    vis.margin = { top: 0, right: 35, bottom: 30, left: 100 };

    vis.width = 500 - vis.margin.left - vis.margin.right,
        vis.height = 1000 - vis.margin.top - vis.margin.bottom;

    //create the svg area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.y = d3.scaleBand()
        .rangeRound([vis.height, 0])
        .paddingInner(0.1);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");


    // (Filter, aggregate, modify data)
    vis.wrangleData(vis.data);
}



/*
 * Data wrangling
 */

timelineChart.prototype.wrangleData = function(data){
    var vis = this;

    // (1) Group data by key variable (e.g. 'electricity') and count leaves
    // (2) Sort columns descending

    /*  vis.nest = d3.nest()
          .key(function (d) {
              return d[vis.config];
          })
          .rollup(function (leaves) { return leaves.length; })
          .entries(data);

      vis.nest.sort(function(a, b) { return a.value - b.value; }); */

    // Update the visualization
    vis.updateVis(vis.nest);
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

timelineChart.prototype.updateVis = function(data){
    var vis = this;


//update the domains
    vis.y.domain(data.map(function(d) { return d.Date; }));
//vis.x.domain([0, d3.max(data, function(d) {
//    return d.value; })]);

    /*

//draw the bar chart
    vis.timelineChart = vis.svg.selectAll("rect")
        .data(data);

	vis.timelineChart.enter().append("rect")
        .attr("class", "bar")

	.merge(vis.timelineChart)
        .transition()
        .duration(1000)
    .attr("fill", "#673AB7")
    .attr("x", 0)
    .attr("y", function(d){
        return vis.y(d.key);
    })
    .attr("height", vis.y.bandwidth())
    .attr("width", function(d){
        return vis.x(d.value);
    });

vis.timelineChart.exit().remove();

// Update the y-axis
vis.svg.select(".y-axis")
    .transition()
    .duration(1000)
    .call(vis.yAxis);

//append labels to the bars

    vis.labels= vis.svg.selectAll(".text")
        .data(data);

    vis.labels.enter().append("text")
        .attr("class","text")

        .merge(vis.labels)
        .transition()
        .duration(1000)
        .attr("fill", "#757575")
        .attr("x", function(d){
            return vis.x(d.value)+1;
        })
        .attr("font-size", "11")
        .attr("y", function(d){
            return vis.y(d.key) +vis.y.bandwidth() /2;
            })
        .text(function(d) {
            return d.value; });


    vis.labels.exit().remove();
*/

}
