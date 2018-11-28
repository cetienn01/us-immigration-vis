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
        .call(vis.xAxis);


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

    var parseDate = d3.timeParse("%Y");

    vis.data.sort(function(a, b) { return a.year - b.year; });

    vis.data.forEach(function(d){
        d.year=+d.year;
        d.year=parseDate(d.year);
    })


    vis.updateVis();

}

/*
 * The drawing function
 */

TrendLine.prototype.updateVis = function(){
    var vis = this;

    var formatDate = d3.timeFormat("%Y");
    var parseDate = d3.timeParse("%Y");

    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d){
                return formatDate(d.year) + '<br>' + 'Applications: ' + d.Receipts + '<br>' + 'Acceptances: ' + d.Approvals;
        })
        .offset([0,0]);

    vis.svg.call(vis.tip);

    vis.x.domain(d3.extent(vis.data, function(d) {
        return d.year;
    }));

    vis.y.domain([0, d3.max(vis.data, function(d) {
        return d.Receipts;
    })]);

    var line1= vis.svg.selectAll(".trendline1")
        .data(vis.data);

    line1.enter().append("path")
        .attr("class", "trendline1")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide)

        .merge(line1)
        .transition()
        .duration(100)
        .attr("d", vis.approvalsline(vis.data))
        .attr("fill", "none")
        .style("stroke", "var(--main-color)");


    line1.exit().remove();

    var line2= vis.svg.selectAll(".trendline2")
        .data(vis.data);

    line2.enter().append("path")
        .attr("class", "trendline2")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide)

        .merge(line2)
        .transition()
        .duration(100)
        .attr("d", vis.applicationsline(vis.data))
        .attr("fill", "none")
        .style("stroke", "var(--secondary-color)");


    line2.exit().remove();


    // Call axis functions with the new domain

    vis.svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(vis.yAxis);

    vis.svg.select(".x-axis")
        .transition()
        .duration(1000)
        .call(vis.xAxis);

    vis.svg.call(vis.tip);

    var trumpdate= vis.x(parseDate("2016"))
    console.log(trumpdate)

    //annotations from susie liu's annotations library
    const annotations = [{
        note: { label: "Election of Donald Trump" },
        subject: {
            y1: vis.margin.top,
            y2: vis.height
        },
        y: vis.margin.top,
        x: trumpdate //position the x based on an x scale
    }];

    const type = d3.annotationCustomType(
        d3.annotationXYThreshold,
        {"note":{
                "lineType":"none",
                "orientation": "top",
                "align":"middle"}
        }
    );

    const makeAnnotations = d3.annotation()
        .type(type)
        .annotations(annotations)
        .textWrap(30)

    vis.svg.append("g")
        .attr("class", "annotation-group")
        .call(makeAnnotations)


}