
//NOTE: This is Elyse's map from the midterm, just to scrounge for useable code.

//var currentwidth= $("#area_chart").width();

var margin = { top: 40, right: 100, bottom: 100, left: 60 };

var width = 1100 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

var svg = d3.select("#map_area").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geoMercator()
    .scale([width/2])
    .translate([width/5, height / 2]);


var path = d3.geoPath()
    .projection(projection);


var color = d3.scaleQuantize()
    .range(colorbrewer.Blues[9]);

function updateChoropleth() {

  // get current user selection
    var currentSelection= d3.select("#selected_value").property("value");


//set the new range based on user selection
// used color brewer for the legend scale.  I chose 7 values to have a wide range but to avoid white as the minimum color since white corresponds to no value
    resetRange()
    function resetRange(){
        if (currentSelection=="waterValue") {
            color.range(colorbrewer.Blues[7]);
        }
        if (currentSelection=="sanitationValue") {
           color.range(colorbrewer.Greys[7]);
        }
        if (currentSelection=="populationValue") {
            color.range(colorbrewer.YlOrBr[7]);
        }
    };


    //define the domain based on user selection
    color
        .domain([
        d3.min(mapData, function(d) { return d.properties[currentSelection]; }),
        d3.max(mapData, function(d) { return d.properties[currentSelection]; })
    ]);

    //determine if there is data
    function testPercent(value) {
        if (value){
            return value + "%"
        }
        else{
            return "No Data"
        }
    }

    function testPopulation(value) {
        if (value){
            return value + "people"
        }
        else{
            return "No Data"
        }
    }

    //create tooltips
    var tip=d3.tip()
        .attr("class", "d3-tip")
        .html(function(d){
            return d.properties.admin + "<br>"
                + "Population: " + d3.format(",")(d.properties.populationValue) + "<br>"
                + "Water Improvement: " + testPercent(d.properties.waterValue)+ "<br>"
                    + "Sanitation Improvement: " + testPercent(d.properties.sanitationValue);
                })
        .offset([0,0]);

    svg.call(tip)


//draw map
    var map = svg.selectAll("path")
        .data(mapData);

        map.enter().append("path")
            .style("fill", "#ffffff")
            .style("stroke", "#000000")
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)

        .attr("d", path)

            .merge(map)
            .transition()
            .duration(1500)
        .style("fill", function(d) {
            var value = d.properties[currentSelection];
            if (value) {
                return color(value);
            } else {
                return "var(--background-color)";
            }
        })


        map.exit().remove();


    //draw map legend. Used Susie Lu's legend library https://d3-legend.susielu.com/
    drawLegend();
    function drawLegend() {

        var legend = svg.append("g")
            .attr("class", "legendThreshold")
            .attr("transform", "translate(" + width / 1.4 + "," + height / 1.7 + ")");

        legend.append("text")
            .attr("class", "caption")
            .attr("x", 0)
            .attr("y", -40)
            .attr("font-size", 15)
            .text("Scale");


        legend = d3.legendColor()
            .shapeWidth(15)
            .shapePadding(5)
            .shapeHeight(15)
            .scale(color);

        if (currentSelection=="populationValue"){
           legend.labelFormat(d3.format(",r"))
        }
        else {
            legend.labelFormat(d3.format(".1f"))
        }

        svg.select(".legendThreshold")
            .call(legend);
    }

    infoDetails(currentSelection);

}

//add dynamic test content to change when the user changes the selection from the map drop down
function infoDetails(selection){

    //clear old text
    $('#info_details li').remove();
    $('#info_details hr').remove();

    //when population value is selected
    if (selection=="populationValue"){
        //console.log("you selected population value")

        $("#info_details")
            .append("<li id='population_header'>" + "Population in African Countries, 2015" + "</li>")
            .append("<li id='about_viz'>" +
                "The interactive visualization to the left currently displays the population of African countries in 2015." + "<br>" +
                "Select the drop down menu to view  2015 improvements in water or sanitation." + "<br>" +
                "Hover over individual countries for details." + "<br>" +
                "Note: countries are displayed in white if no data is available.\n"
                + "</li>")
            .append("<hr id='population_hr'>")
            .append("<li id='population_header' class='details_header'>" + "Poverty and Water" + "</li>")
            .append("<li>" + "<em>" +
                "\"Poverty in Africa is often caused by a lack of access to clean, safe water and proper sanitation.\"\n" + "</em>" +
                "(The Water Project)\n" + "<br>" + "<br>" +
                "There are a number of reasons why poverty has become an epidemic in Africa. Poverty can be\n" +
                "the result of political instability, ethnic conflicts, climate change and other man-made causes.\n" +
                "But one of the greatest causes of poverty in Africa is also the most overlooked... the lack of\n" +
                "access to clean drinking water."
                + "</li>"
            )
    }

    //when water value is selected
    if (selection=="waterValue"){

        $("#info_details")
            .append("<li id='water_header'>" + "Water Improvement in African Countries, 2015" + "</li>")
            .append("<li id='about_viz'>" +
                "The interactive visualization to the left currently displays the percent of the population using improved drinking water sources in African countries in 2015." + "<br>" +
                "Select the drop down menu to view  2015 populations or improvements in sanitation." + "<br>" +
                "Hover over individual countries for details." + "<br>" +
                "Note: countries are displayed in white if no data is available.\n"
                + "</li>")
            .append("<hr id='water_hr'>")
            .append("<li id='water_header' class='details_header'>" + "Population Growth and Rural-Urban Migration" + "</li>")
            .append("<li>" +
                "Africa’s rising population is driving demand for water and accelerating the degradation of\n" +
                "water resources in many countries on the continent. Among developing regions, Sub-Saharan\n" +
                "Africa is estimated to have the highest prevalence of urban slums and it is expected to\n" +
                "double to around 400 million by 2020. Despite the efforts of some Sub-Saharan African\n" +
                "countries and cities to expand basic services and improve urban housing conditions. Rapid\n" +
                "and unplanned urban growth has increased the number of settlements on unstable,\n" +
                "flood-prone, and high-risk land where phenomena such as landslides, rains, and earthquakes\n" +
                "have devastating consequences."
                + "</li>")

    }

    //when sanitation value is selected
    if (selection=="sanitationValue"){

        $("#info_details")
            .append("<li id='sanitation_header'>" + "Sanitation Improvement in African Countries, 2015" + "</li>")
            .append("<li id='about_viz'>" +
                "The interactive visualization to the left currently displays the percent of the population using improved sanitary facilities in African countries in 2015." + "<br>" +
                "Select the drop down menu to view  2015 populations or improvements in water access." + "<br>" +
                "Hover over individual countries for details." + "<br>" +
                "Note: countries are displayed in white if no data is available.\n"
                + "</li>")
            .append("<hr id='sanitation_hr'>")
            .append("<li id='sanitation_header' class='details_header'>" + "Economic development and poverty" + "</li>")
            .append("<li>" + "Sub-Saharan Africa is the world’s poorest and least developed region, with half its population\n" +
                "living on less than a dollar a day. About two-thirds of its countries rank among the lowest in\n" +
                "the Human Development Index. Even when opportunities exist to address outstanding water issues, deep and widespread poverty across the African region constrains the ability of many\n" +
                "cities and communities to provide proper water and sanitation services, sufficient water for\n" +
                "economic activities and to prevent water quality from deteriorating."
                + "</li>")

    }


}
