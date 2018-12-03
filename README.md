## WORK IN THE USA: The Past Decade of US Work Visas in Numbers

All files are located at the following GitHub repository:
https://github.com/seatuna/us-immigration-vis

Website: https://seatuna.github.io/us-immigration-vis/

Screencast: https://youtu.be/51rdfsCVwUg

Website is best viewed on a laptop screen.

## Files
The following files can be found in the repository:
* cleaned-data: contains data downloaded and cleaned/scrapped from USCIS, DOS, DHS used in this visualization project.  Original data can be downloaded from:<br/>
https://www.uscis.gov/tools/reports-studies/immigration-forms-data<br/>
https://travel.state.gov/content/travel/en/legal/visa-law0/visa-statistics/nonimmigrant-visa-statistics.html<br/>
https://www.dhs.gov/immigration-statistics/yearbook/2017

* css and fonts: css files, including bootstrap, fonts for the website
* img: images used for the website
* js: javascript code for website.  Libraries specifically used were bootstrap, colorbrewer, d3, fullpage, jquery, topojson.  JS scripts are,
  - main.js : This script is used to load all the visualizations by calling several helper scripts, specifically,
    1. countrytrendline.js: draw the user selected country trendlines for H1B, H2A/B; displays additional world events, if any.
    2. map-vis.js:  Contains the Map prototype class that is responsible for the world and US maps
    3. timeline.js Add timeline of policy/law
    4. workVis.js: adds the area chart for the total number of work visas over time  along with the brush for the work visa
    5. workVisBar.js: adds the individual bar charts to show more details or characteristics of workers

## JS Libraries
The following js libraries were used (BIG thanks to the creators!):
* d3 annotations https://d3-annotation.susielu.com/ 
* fullpage https://alvarotrigo.com/fullPage/ 
* color brewer http://colorbrewer2.org/   
* d3-legend https://d3-legend.susielu.com/

All stories are photos are credited on the individual pages, but special thanks to https://myimmigrationstory.com/ and https://cla.umn.edu/ihrc/immigrant-stories for stories. 

## Website interface/layout for interactive visualizations

* Where are people from?<br/>
User can select a country of interest by clicking on the country to get the number of people migrating to US for work.  The side panel displays country specific data and the year of interest can be selected using the slider along with the visa type of interest: H1B, H2A/B.
* What is the history?<br/>
Graphical display of major immigration and work related policies/laws enacted in the USA.  Clicking on the individual policy or law will give more details on the side panel, buttons are located on the top to select US government branch responsible.
* Who are they?<br/>
Area chart provides the total number H-1B visa approved, a user can brush to select specific range/years.  Right panel gives additional characteristics of the approved work visa immigrants with respect to: age, education, salary, occupation and industry – this will change based on brush selection.
* Where do people go?<br/>
Display of specific state where work visa recipients reside.  User can select between 2016 and 2017, bar chart on the side panel displays the exact numbers for selected state.
* What are the time trends?<br/>
Visualizes trend of the work visa types, H1B and H2A/B, over time where the user can select a specific country.  Any important or major world event will be marked on the graph as well for individual countries (eg: Syria, Iraq, United Kingdom, etc).
