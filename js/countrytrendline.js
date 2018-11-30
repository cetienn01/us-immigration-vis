/*
 * CountryTrendLine - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the area chart
 * @param _data						-- the dataset 'household characteristics'
 */

CountryTrendLine = function(_parentElement, _data, _data2, _data3, _country){
    this.parentElement = _parentElement;
    this.data = _data;
    this.data2=_data2;
    this.data3=_data3;
    this.displayData = [];
    this.country=_country;

    this.initVis();
}

/*
 * Initialize visualization (static content; e.g. SVG area, axes, brush component)
 */

CountryTrendLine.prototype.initVis = function(){
    var vis = this;

    // * TO-DO *
    vis.margin = { top: 40, right: 60, bottom: 60, left: 60 };

    vis.width = 700 - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;


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
        //interpolate("basis")
        .x(function(d) {
            return vis.x(d.year); })
        .y(function(d) { return vis.y(d.approvals); })
        .curve(d3.curveLinear);

    var formatDate = d3.timeFormat("%Y");

    //tooltip
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d){
            return formatDate(d.year) + 'Acceptances: ' + d.approvals;
        })
        .offset([0,0]);



    // (Filter, aggregate, modify data)
    vis.wrangleData();


}


/*
 * Data wrangling
 */

CountryTrendLine.prototype.wrangleData = function(){
    var vis = this;

    vis.updateVis(vis.data, vis.data2, vis.data3,vis.country);

}

/*
 * The drawing function
 */

CountryTrendLine.prototype.updateVis = function(data, data2, data3, country){
    var vis = this;

    console.log(data)

    var formatDate = d3.timeFormat("%Y");


    vis.x.domain(d3.extent(data, function(d) {
        return d.year;
    }));

    //check which visa type has more and set that as the domain
    if( (d3.max(data, function(d){return d.approvals})) >= (d3.max(data2, function(d){return d.approvals}))) {
        vis.y.domain([0, d3.max(data, function(d) {
            return d.approvals;
        })]);
    }
    else{
        vis.y.domain([0, d3.max(data2, function(d) {
            return d.approvals;
        })]);
    }

    //draw the first visa line
    var line= vis.svg.selectAll(".countryline1")
        .data(data);

        line.enter().append("path")
            .attr("class", "countryline1")
            .on('mouseover', vis.tip.show)
            .on('mouseout', vis.tip.hide)

            .merge(line)
            .transition()
            .duration(1000)
            .attr("d", vis.countryline(data))
            .attr("fill", "none")
            .style("stroke", "var(--main-color)")
            .style("shape-rendering", "geometricPrecision");


        line.exit().remove();

    //draw the second visa line
    var line2= vis.svg.selectAll(".countryline2")
        .data(data2);

    line2.enter().append("path")
        .attr("class", "countryline2")

        .merge(line2)
        .transition()
        .duration(1000)
        .attr("d", vis.countryline(data2))
        .attr("fill", "none")
        .style("stroke", "var(--tertiary-color)")
        .style("shape-rendering", "geometricPrecision")
        .style("shape-rendering", "geometricPrecision");


    line2.exit().remove();


    //draw the third visa line
    var line3= vis.svg.selectAll(".countryline3")
        .data(data3);

    line3.enter().append("path")
        .attr("class", "countryline3")

        .merge(line3)
        .transition()
        .duration(1000)
        .attr("d", vis.countryline(data3))
        .attr("fill", "none")
        .style("stroke", "var(--secondary-color")
        .style("shape-rendering", "geometricPrecision");


    line3.exit().remove();

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

    vis.annotate(country);

}

CountryTrendLine.prototype.annotate = function(country) {
    var vis = this;

    //annotations from susie liu's annotations library

    var parseDate = d3.timeParse("%Y");
    var trumpdate= vis.x(parseDate("2016"));
    var syrianwardate=vis.x(parseDate("2011"));
    var iraqwarend=vis.x(parseDate("2011"));
    console.log(trumpdate)

    const annotations = [{
        note: { label: "Election of Donald Trump" },
        subject: {
            y1: 0,
            y2: vis.height
        },
        y: vis.margin.top,
        x: trumpdate
    }];

    if (country=="Syria"){
        annotations.push({
            note: {label: "Start of the War in Syria"},
            subject: {
                y1: 0,
                y2: vis.height
            },
            y: vis.margin.top,
            x: syrianwardate
        })
    }

    if (country=="Iraq"){
        annotations.push({
            note: {label: "End of the Iraq War"},
            subject: {
                y1: 0,
                y2: vis.height
            },
            y: vis.margin.top,
            x: iraqwarend
        })
    }

    const type = d3.annotationCustomType(
        d3.annotationXYThreshold,
        {"note":{
                "lineType":"none",
                "orientation": "right",
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
