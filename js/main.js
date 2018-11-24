
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
    var dataEdu=transpose(eduTotal,"Education");
    var dataAge=transpose(ageTotal,"Age");
    var dataSalary=transpose(salaryTotal,"Salary");
    var dataOccupation=transpose(occupationTotal,"Occupation");
    var dataIndustry=transpose(industryTotal,"Industry");
    //console.log(dataTotal);


    //make an area chart for total number of work visas
    areachart = new AreaChart("work_map_area", dataTotal);

    //make bar chart for education
    edu_barchart = new BarChart("work_details_area", dataEdu, "Education");
    //make bar chart for age
    age_barchart = new BarChart("work_details_area", dataAge, "Age");
    //make bar chart for salary
    salary_barchart = new BarChart("work_details_area", dataSalary, "Salary");
    //make bar chart for occupation
    occupation_barchart = new BarChart("work_details_area", dataOccupation, "Occupation");
    //make bar chart for industry
    industry_barchart = new BarChart("work_details_area", dataIndustry, "Industry");
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
        .defer(d3.csv, 'cleaned-data/yrbk-2017-permanent-resident-by-state.csv')
        .defer(d3.csv, 'data/work_visa_trends_2007_2017/work_visa_country.csv')
        // .defer(d3.csv, 'cleaned-data/yrbk-2017-permanent-resident-by-country.csv')
        .await(createVis)

}

function createVis(error, worldMapData, countryNames, usMapData, immigrationByState, immigrationByCountryData) {

    console.log(timelineData);

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