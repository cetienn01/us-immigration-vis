
var timelineData;


//this will become a queue when we all merge together
loadData();

function loadData() {

    d3.csv("data/immigration_policy.csv", function (data) {

        data.forEach(function (d) {
            d.Date = +d.Date;
        });

        timelineData = data;
        //console.log(householdData);
        createVis();

    });

}

function createVis(){

    console.log(timelineData)

    //create timeline chart
    timeline=new timelineChart("timeline_area", timelineData);


}
