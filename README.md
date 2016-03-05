# HistoricalAnalysisTool

When the user specifies a job with an Allure report (e.g. 7700_Voodoo_Tests/) and a number of test runs to display (e.g. 10), this tool pulls all the unstable tests from the most recent X runs of that job. A table is produced that outputs each unstable test's stability percentage along with the test status for number of runs specified. There is an optional field for the user to have the output generated for a single specific test. 

Hovering over the grey area under the table headers will trigger the hidden search feature to narrow down the search results.

Setup
------------
- Install node.js
- Run 'npm install' to install required node modules
- Run 'app.js' to start the server
