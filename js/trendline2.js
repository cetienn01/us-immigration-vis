// SVG drawing area

var margin = {top: 40, right: 40, bottom: 60, left: 60};

var width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Date parser
var formatDate = d3.timeFormat("%Y");
var parseDate = d3.timeParse("%Y");

var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);


// Initialize data
loadData();

// FIFA world cup
var data;


// Load CSV file
function loadData() {
    d3.csv("data/fifa-world-cup.csv", function(error, csv) {

        csv.forEach(function(d){
            // Convert string to 'date object'
            d.YEAR = parseDate(d.YEAR);

            // Convert numeric values to 'numbers'
            d.TEAMS = +d.TEAMS;
            d.MATCHES = +d.MATCHES;
            d.GOALS = +d.GOALS;
            d.AVERAGE_GOALS = +d.AVERAGE_GOALS;
            d.AVERAGE_ATTENDANCE = +d.AVERAGE_ATTENDANCE;
        });

        // Store csv data in global variable
        data = csv;

        // Draw the visualization for the first time
        updateVisualization();
    });
}


// Render visualization
function updateVisualization() {

    var tooltipOffset=-10;

    //get dynamic variables
    var yType= d3.select("#ranking-type").property("value");
    var xStartYear=parseDate(d3.select("#start-year").property("value"));
    var xEndYear=parseDate(d3.select("#end-year").property("value"));

    //sort data
    data.sort(function(a, b) { return a.YEAR - b.YEAR; });

    //set domains
    x.domain([xStartYear, xEndYear])
    //console.log(xStartYear)
    //console.log(xEndYear)

    y.domain([0, d3.max(data, function(d) {
        return d[yType];
    })
    ]);

    //create tooltip
    var tip=d3.tip()
        .attr("class", "d3-tip")
        .html(function(d){
            console.log(d[yType]);
            return d.EDITION + "<br>"+ yType + ": " + d[yType];
        })
        .offset([tooltipOffset,0]);


    //create axes
    var yAxis = d3.axisRight()
        .scale(y);

    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxisGroup = svg.append("g")
        .attr("class", "y-axis axis");

    var xAxisGroup = svg.append("g")
        .attr("class", "x-axis axis");

    //create line graph
    var lineGraph = d3.line()
        .x(function(d){
            if( d.YEAR>=xStartYear || d.YEAR<=xEndYear) {
                return x(d.YEAR)
            }
        })
        .y(function(d){return y(d[yType])})
        .curve(d3.curveCatmullRom.alpha(0.5));



    var lines=svg.selectAll("path")
        .data(data);

    lines.enter().append("path")
        .attr("class", "line")

        .merge(lines)
        .transition()
        .duration(1000)
        .attr("d", lineGraph(data));

    lines.exit().remove();

    svg.call(tip)

    //create data points for line graph
    var dataPoints= svg.selectAll(".dot")
        .data(data);

    dataPoints.enter().append("circle")
        .attr("class", "dot")
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .on("click", function(d) {
            showEdition(d.EDITION);
        })

        .merge(dataPoints)
        .transition()
        .duration(1000)
        .attr("cx", function(d) {
            if( d.YEAR>= xStartYear || d.YEAR<=xEndYear) {
                return x(d.YEAR)
            }
        })
        .attr("cy", function(d) { return y(d[yType]) })
        .attr("r", 5);


    dataPoints.exit().remove();


    //add axes
    svg.select(".y-axis")
        .transition()
        .duration (1000)
        .call(yAxis)
        .attr("transform", "translate(" + width + ", 0)");

    svg.select(".x-axis")
        .transition()
        .duration (1000)
        .call(xAxis)
        .attr("transform", "translate(0," + (height)+")");

    svg.select(".d3-tip")
        .call(tip);



}

// Show details for a specific FIFA World Cup
function showEdition(edition){

    $('#details_list li').remove();

    for (i=0; i<data.length; i++) {


        if (data[i].EDITION== edition) {

            $("#details_list")
                .append("<li id='list_header'>" + data[i].EDITION + "</li>")
                .append("<li>" + "Winner: " + data[i].WINNER + "</li>")
                .append("<li>" + "Goals: " + data[i].GOALS + "</li>")
                .append("<li>" + "Average Goals: " + data[i].AVERAGE_GOALS + "</li>")
                .append("<li>" + "Matches: " + data[i].MATCHES + "</li>")
                .append("<li>" + "Teams: " + data[i].TEAMS + "</li>")
                .append("<li>" + "Average Attendance: " + data[i].AVERAGE_ATTENDANCE + "</li>");
        }
    }

}
