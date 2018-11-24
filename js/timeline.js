

/*
CODE FROM OLD BARCHART FILE

 * timelineChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data						-- the dataset 'household characteristics'
 * @param _config					-- variable from the dataset (e.g. 'electricity') and title for each bar chart
 */

timelineChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    //this.config = _config;
    this.displayData = _data;

    this.initVis();
}



/*
 * Initialize visualization (static content; e.g. SVG area, axes)
 */

timelineChart.prototype.initVis = function(){
    var vis = this;

    //margins and sizing
    vis.margin = { top: 30, right: 35, bottom: 0, left: 150 };

    vis.width = 500 - vis.margin.left - vis.margin.right,
        vis.height = 650 - vis.margin.top - vis.margin.bottom;

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

    data.sort(function(a, b) { return b.Date - a.Date; });

    // Update the visualization
    vis.updateVis(vis.data);
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 */

timelineChart.prototype.updateVis = function(data){
    var vis = this;
    var currentSelection= d3.select("#timeline_selection").property("value");

    if (currentSelection!="default") {
        data= data.filter(function (d) {
            return d.Type==currentSelection;
            })
            console.log(data);
    }


//update the domains
    vis.y.domain(data.map(function(d) { return d.Date; }));
//vis.x.domain([0, d3.max(data, function(d) {
//    return d.value; })]);



//draw event circles
    vis.timelineChart = vis.svg.selectAll(".event_circle")
        .data(data);

	vis.timelineChart.enter().append("circle")
        .attr("class", "event_circle")
        .on("click", function(d, i) {
            vis.timelineClick(i);
        })

	.merge(vis.timelineChart)
        .transition()
        .duration(1000)

    .attr("fill", "#810f7c")
        .attr("r", 5)
    .attr("cx", 0)
        .attr("cy", function(d){
            return vis.y(d.Date) +vis.y.bandwidth() /2;
        });

vis.timelineChart.exit().remove();



//append labels to the bars
    //TO DO: Handle years with more than one event.

    vis.labels= vis.svg.selectAll(".text")
        .data(data);

    vis.labels.enter().append("text")
        .attr("class","text")
        .on("click", function(d, i) {
            vis.timelineClick(i);
        })


        .merge(vis.labels)
        .transition()
        .duration(1000)
        .attr("fill", "#757575")
        .attr("x", 5)
        .attr("font-size", "13")
        .attr("y", function(d){
            return vis.y(d.Date) +vis.y.bandwidth() /2;
            })
        .text(function(d) {
            return d.Name; });


    vis.labels.exit().remove();


    // Update the y-axis
    vis.svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(vis.yAxis);

}

timelineChart.prototype.timelineClick = function(i) {

    //add the details table
    //eventually this will pull the intro paragaph from wikipedia to display

    var vis = this;

    console.log("hello from timelineclick")

    $('#timeline_details_area li').remove();

    $("#timeline_details_area")
        .append ("<li id='timeline_list_header'>" + vis.data[i].Name + "</li>")
        .append("<li>" + "Year: " + vis.data[i].Date + "</li>")
        .attr("x", 10)
        .attr("y", 10);


}
