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

    vis.svg.append("path")
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
    vis.svg.select(".y-axis").call(vis.yAxis);


}

TrendLine.prototype.addCountry = function(data, country) {

    /* TO DO:
    Get the Country Input from user and display their country line.


    var vis = this;

    var currentCountry = {
        approvals[],
        year[]
    }
}

    for (var i=0; i<data.length; i++) {
        if (data[i].Country==country) {
           // currentCountry.name= data[i].Country;
            currentCountry[0].approvals = data[i].year2017;
            currentCountry[0].year=2017;
            currentCountry[1].approvals = data[i].year2016;
            currentCountry[2].approvals = data[i].year2015;
            currentCountry[3].approvals = data[i].year2014;
            currentCountry[4].approvals = data[i].year2013;
            currentCountry[5].approvals = data[i].year2012;
            currentCountry[6].approvals = data[i].year2011;
            currentCountry[7].approvals = data[i].year2010;
            currentCountry[8].approvals = data[i].year2009;
            currentCountry[9].approvals = data[i].year2008;
            currentCountry[10].approvals = data[i].year2007;
            break;
        }

    }

    var parseDate = d3.timeParse("%Y");

    currentCountry.forEach(function(d){
        d.year=parseDate(d.year);
    })

    console.log(currentCountry);

    vis.countryline = d3.line()
        .x(function(d) { return vis.x(d.year); })
        .y(function(d) { return vis.y(d.approvals); })
        .curve(d3.curveCatmullRom.alpha(0.5));

    vis.svg.append("path")
        .data(currentCountry)
        .attr("class", "line")
        .style("stroke", "red")
        .attr("fill", "none")
        .attr("d", vis.countryline(currentCountry));

*/
}