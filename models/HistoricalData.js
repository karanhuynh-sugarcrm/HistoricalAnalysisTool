var async = require('async');

/*
@constructor
@param {Object} All the simplified allure reports processed by AllureParser 
@param {string} Optional to search for a specific test
*/
function HistoricalData(allureReports, singleTest) {
    this.allureReports = allureReports;
    this.singleTest = singleTest;
}
/*
Compares test results accross multiple test runs and generates all the test results for the indivudal tests 
starting from most recent test run to least recent
@public
@returns {Object} Key : test case name; Value : test details including stability percentage, buildIDs and the respective status 
*/
HistoricalData.prototype.statusDiff = function() {
    var results = {};
    var current = 0;
    var previous = 1
    var allureReports = this.allureReports;
    var len = allureReports.length; 
    for (var i = 0; i < len - 1; i++) {
        // Single search test name specified so process a single test search
        if (this.singleTest) {
            // Check if single test search exists
            // Potential issue where searching for test that got deleted in most recent test run must be handled in 'else{}'
            if (allureReports[current][this.singleTest]) {
                // Must add single test to found results
                if (results[this.singleTest] == undefined) {
                    addTest(results, this.singleTest);
                }
                this.compareStatus(results, this.singleTest, current, previous);
            }
        // Process all unstable tests   
        } else {
            for (var testName in allureReports[current]) {           
                this.compareStatus(results, testName, current, previous);            
            }
        }
        previous++;
        current++;
    }
    // Assigns test details returned results
    genFloppyTests(results, allureReports, len);
    return results;
};
/*
Compares test status of consecutive test runs to find all unstable tests
@public
*/
HistoricalData.prototype.compareStatus = function(results, testName, current, previous) {
    var allureReports = this.allureReports;
    // Accepting statuses 
    var pass = {
        PASSED: "PASSED",
        PENDING: "PENDING",
        NONE: "NONE",
    };
    // Failing statuses
    var fail = {
        BROKEN: "BROKEN",
        FAILED: "FAILED"
    };
    // New test added
    if (allureReports[previous][testName] == undefined) {
        allureReports[previous][testName] = {
            'status' : "NONE"
        }
    }
    // Checks if test is unstable
    if ((fail[allureReports[previous][testName].status] &&
        pass[allureReports[current][testName].status]) ||
        (fail[allureReports[current][testName].status] &&
        pass[allureReports[previous][testName].status])) {
        // New unstable test found
        if (results[testName] == undefined) {
            addTest(results, testName);
        }
        // Add to count of unstable test outcomes
        results[testName].flop++;
    }  
};
// test details object structure 
function addTest(arr, name) {
    arr[name] = {
        name : name,
        stat : 100,
        flop : 0,
        arr : {},
        total : 0
    };
}
/* Asyncronously assigns unassigned test details to tests
   Sums total of successful test results of a test 
   Assigns status for test runs with and without a test result
   Assigns stack trace URL
   Calculates stability percentage
   @private
   @param {Object} Keys : Test case names ;Value : Test details
   @param {Object} All the simplified allure reports processed by AllureParser
   @param {integer} Length of allureReports
*/
function genFloppyTests(results, allureReports, len) {
    var floppyTests = Object.keys(results);
    results.resultsFound = floppyTests.length;
    async.forEach(floppyTests, function (item, callback) {
        for (var i = 0; i < len; i++) {
            // Test result exists
            if (allureReports[i][item].status !== "NONE") {
                var b = allureReports[i][item].buildId;
                var stat = 100 * ((len - 1) - results[item].flop) / (len - 1);
                results[item].stat = parseInt(stat);
                results[item].total++;
                results[item].arr[b] = {
                    status: allureReports[i][item].status,
                    link: allureReports[i][item].uri
                }
            // Test result does not exist for test run
            // No information available    
            } else {      
                var b = allureReports[i].buildId;
                results[item].arr[b] = {
                    status: "NONE"
                }
            }
        }
        callback();
    }, function(err) {
        // Error occured in assigning test details
        if (err) {
            console.log('Error in assigning test values ' + err);
        }
    });            
};
module.exports = HistoricalData;