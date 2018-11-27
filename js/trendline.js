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

   /* vis.svg.append("path")
        .data(vis.data)
        .attr("class", "line")
        .style("stroke", "#8c96c6")
        .attr("fill", "none")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide)
        .attr("d", vis.applicationsline(vis.data));

    vis.svg.append("path")
        .data(vis.data)
        .attr("class", "line")
        .attr("fill", "none")
        .style("stroke", "#810f7c")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide)
        .attr("d", vis.approvalsline(vis.data));

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis); */

    var line1= vis.svg.selectAll(".trendline1")
        .data(vis.data);

    line1.enter().append("path")
        .attr("class", "trendline1")

        .merge(line1)
        .transition()
        .duration(100)
        .attr("d", vis.approvalsline(vis.data))
        .attr("fill", "none")
        .style("stroke", "#810f7c");


    line1.exit().remove();

    var line2= vis.svg.selectAll(".trendline2")
        .data(vis.data);

    line2.enter().append("path")
        .attr("class", "trendline2")

        .merge(line2)
        .transition()
        .duration(100)
        .attr("d", vis.applicationsline(vis.data))
        .attr("fill", "none")
        .style("stroke", "#8c96c6");


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


}

/*TrendLine.prototype.addCountry = function(data, country) {

    var vis = this;
    console.log(country);

    console.log(vis.data)
    console.log(data)

    var parseDate = d3.timeParse("%Y");

    vis.countryline = d3.line()
        .x(function(d) { return vis.x(d.year); })
        .y(function(d) { return vis.y(d.approvals); })
        .curve(d3.curveCatmullRom.alpha(0.5));

    //filter for user selection
    var currentCountry = data.filter(function(d){
        return d.Country==country;
    })


    var keys= Object.keys(currentCountry[0]);

    var values=[];

    keys.forEach(function(d){

        if (d!='Country' && d!='Region') {
        value=currentCountry[0][d]
        //console.log(d, value)
        datapoint={}
        datapoint['year']=parseDate(+d);
        datapoint['approvals']=parseFloat(value.replace(/,/g, ''));
        values.push(datapoint)
        }
    })


    console.log(values)

 //   console.log(currentCountry);
    vis.svg.append("path")
        .data(values)
        .attr("class", "line")
        .style("stroke", "red")
        .attr("fill", "none")
        .attr("d", vis.countryline(values));


} */