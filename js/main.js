
// SVG drawing area

var margin = {top: 40, right: 10, bottom: 60, left: 60};

var width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

// Date parser to convert strings to date objects
var parseYear = d3.timeParse("%Y");

// Maps
var immigrationWorldMap;
var immigrationUsMap;

//Trendline
var trendline;
var trendlineCountryData;



// read work visa
queue()
    .defer(d3.csv,"data/work_visa_trends_2007_2017/work_visa_total.csv")
    .defer(d3.csv,"data/work_visa_trends_2007_2017/work_visa_edu.csv")
    .defer(d3.csv,"data/work_visa_trends_2007_2017/work_visa_age.csv")
    .defer(d3.csv,"data/work_visa_trends_2007_2017/work_visa_salary.csv")
    .defer(d3.csv,"data/work_visa_trends_2007_2017/work_visa_occupation.csv")
    .defer(d3.csv,"data/work_visa_trends_2007_2017/work_visa_industry.csv")
    .await(createWorkVis);


function createWorkVis(error, workTotal,eduTotal,ageTotal,salaryTotal,occupationTotal,industryTotal){
    if(error) { console.log(error); }

    //need to transpose the data
    var dataTotal=transpose(workTotal,"Category");

    //metrics
    //work visa metrics
    var workMetrics1 = [
        { key: "Education", title: "Education", data: transpose(eduTotal,"Education")},
        { key: "Age", title: "Age", data:transpose(ageTotal,"Age")}
    ];

    var workMetrics2 = [
        { key: "Salary", title: "Salary", data: transpose(salaryTotal,"Salary")},
        { key: "Occupation", title: "Occupation" , data: transpose(occupationTotal,"Occupation")}
    ];

    var workMetrics3 = [
        { key: "Industry", title: "Industry (Top 15)", data: transpose(industryTotal,"Industry")}
    ];

    //make an area chart for total number of work visas
    areachart = new AreaChart("work_map_area", dataTotal);


    // make a bar chart for each variable in configs
    barcharts1 = workMetrics1.map(function(name) {
        return new BarChart("work_details_area1", name.data, name.title);
    })

    barcharts2 = workMetrics2.map(function(name) {
        return new BarChart("work_details_area2", name.data, name.title);
    });

    barcharts3 = workMetrics3.map(function(name) {
        return new BarChart("work_details_area3", name.data, name.title);
    });

    //make the Trump trendline Chart
    trendline= new TrendLine("trump_trendlines_area", dataTotal);
    updateTrendline();

}

// React to 'brushed' event and update all bar charts
function brushed() {

    // * TO-DO *
    // Get the extent of the current brush
    var selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    var selectionDomain = selectionRange.map(areachart.x.invert);

    var barCharts = [barcharts1,barcharts2,barcharts3];

    barCharts.forEach(function(barChart){
        barChart.forEach(function(barChartDisplay){
            barChartDisplay.selectionChanged(
                d3.event.selection === null  ? areachart.x.domain() : selectionDomain
            );
        });
    });

    // barcharts1.forEach(function(barchart) {
    //     barchart.selectionChanged(
    //         d3.event.selection === null  ? areachart.x.domain() : selectionDomain
    //     );
    // })

}


//function for transposing (work visa trends) data
function transpose(data, category)
{
    var data_t=[];
    data.forEach(function(d,index){
        counter = 0;
        for (var key in d){
            var obj = {};
            if(key !== category) {
                if(index==0) {
                    obj.year = key;
                    obj[d[category]] = Number(d[key].replace(/,/g, ""));
                    data_t.push(obj);
                }else{
                    var obj_temp={};
                    obj_temp[d[category]] = Number(d[key].replace(/,/g, ""));
                    data_t[counter]=Object.assign(obj_temp, data_t[counter]);
                    counter++;
                }
            }
        }
    });
    return data_t;
}


var timelineData;


//this will become a queue when we all merge together
loadData();

function loadData() {

    d3.csv("data/immigration-policy.csv", function (data) {

        data.forEach(function (d) {
            d.Date = +d.Date;
        });

        timelineData = data;

    });

    // Maps
    queue()
        .defer(d3.json, 'data/world-110m.json')
        .defer(d3.tsv, 'data/world-country-names.tsv')
        .defer(d3.json, 'data/us-states.json')
        .defer(d3.csv, 'data/h1b-by-state-2016-2017.csv')
        .defer(d3.csv, 'cleaned-data/country-approvals-clean.csv')
        .await(createVis)

}

function createVis(error, worldMapData, countryNames, usMapData, immigrationByState, immigrationByCountryData) {

    console.log(immigrationByCountryData)

    //create timeline chart
    timeline=new timelineChart("timeline_area", timelineData);

    immigrationWorldMap = new Map('world_map_area', immigrationByCountryData, { map: worldMapData, names: countryNames, mapType: 'world' });
    immigrationUsMap = new Map('states_map_area', immigrationByState, { map: usMapData, mapType: 'us' });
}

function updateTimeline() {
    timeline.updateVis(timelineData)

}

function updateWorldMap() {
    immigrationWorldMap.filterData();
}

function updateUsMap() {
    immigrationUsMap.filterData();
}


function updateTrendline() {
    d3.csv("cleaned-data/country-approvals.csv", function (data) {

        data.forEach(function (d) {
            d.year2017 = +d.year2017;
            d.year2016=+d.year2016;
            d.year2015 = +d.year2015;
            d.year2014=+d.year2014;
            d.year2013 = +d.year2013;
            d.year2012=+d.year2012;
            d.year2011 = +d.year2011;
            d.year2010=+d.year2010;
            d.year2009=+d.year2009;
            d.year2008=+d.year2008;
            d.year2007=+d.year2007;
        });

        trendlineCountryData = data;

        //test country
        var country="Greece";
        // console.log(country)

        trendline.addCountry(trendlineCountryData, country);

    });

  //  var country= $("#countryName").val();




}