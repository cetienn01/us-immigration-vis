
// SVG drawing area

var margin = {top: 40, right: 10, bottom: 60, left: 60};

var width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

// Date parser to convert strings to date objects
var parseYear = d3.timeParse("%Y");

// read work visa
d3.csv("data/work_visa_trends_2007_2017/work_visa_total.csv", function(error, csv){

    var data = csv;

    // transpose
    var data_t=[];

    data.forEach(function(d,index){
        counter = 0;
        for (var key in d){
            var obj = {};
            if(key !== "Category") {
                if(index==0) {
                    obj.year = key;
                    obj.receipts = Number(d[key].replace(/,/g, ""));
                    data_t.push(obj);
                }else{
                    data_t[counter]=Object.assign({"approvals":+d[key].replace(/,/g, "")}, data_t[counter]);
                    counter++;
                }
            }
        }
    });

    // data_t.forEach(function(d){
    //     d.year=parseYear(d.year);
    // });

    //console.log(data_t);

    //make an area chart for total number of work visas
    areachart = new AreaChart("work_details_area", data_t);
});



var timelineData;


//this will become a queue when we all merge together
loadData();

function loadData() {

    d3.csv("data/immigration-policy.csv", function (data) {

        data.forEach(function (d) {
            d.Date = +d.Date;
        });

        timelineData = data;
        createVis();

    });

}

function createVis(){

    console.log(timelineData)

    //create timeline chart
    timeline=new timelineChart("timeline_area", timelineData);
}


function updateTimeline() {
    timeline.updateVis(timelineData)

}