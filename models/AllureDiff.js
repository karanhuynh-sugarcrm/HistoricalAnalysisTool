var async = require('async');

function AllureDiff(allureReports, singleTest) {
    this.allureReports = allureReports;
    this.singleTest = singleTest;
}
// Finds the difference in test results 
AllureDiff.prototype.statusDiff = function() {
    var results = {};
    var current = 0;
    var previous = 1
    var allureReports = this.allureReports;
    var len = allureReports.length; 
    for (var i = 0; i < len - 1; i++) {
        // Process a single test search
        if (this.singleTest) {
            // Check if single test search exists
            if (allureReports[current][this.singleTest]) {
                // Add single test to found results
                if (results[this.singleTest] == undefined) {
                    addTest(results, this.singleTest);
                }
                this.compareStatus(results, this.singleTest, current, previous);
            }
            // HEREEEEEEEE GENERATE ERROR MESSAGE TEST DNEEEEEEE
        // Process all flopping tests    
        } else {
            for (var testName in allureReports[current]) {           
                this.compareStatus(results, testName, current, previous);            
            }
        }
        previous++;
        current++;
    }
    genFloppyTests(results, allureReports, len);
    return results;
};
AllureDiff.prototype.compareStatus = function(results, testName, current, previous) {
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
    // Status differ
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
    return results;
};
// Results object structure 
function addTest(arr, name) {
    arr[name] = {
        name : name,
        stat : 100,
        flop : 0,
        arr : {},
        total : 0
    };
}
// Gets total of test runs with a test result which is now uncessary
// Assigns status for test runs with and without a test result
// Assigns stack trace URL
// Calculates stability percentage
function genFloppyTests(results, allureReports, len) {
    var floppyTests = Object.keys(results);
    results.numUnstableTests = floppyTests.length;
    async.forEach(floppyTests, function (item, callback) {
        for (var i = 0; i < len; i++) {
            if (allureReports[i][item].status !== "NONE") {
                //console.log(results[item]);
                var b = allureReports[i][item].buildId;
                var stat = 100 * ((len - 1) - results[item].flop) / (len - 1);
                results[item].stat = parseInt(stat);
                results[item].total++;
                results[item].arr[b] = {
                    status: allureReports[i][item].status,
                    link: allureReports[i][item].uri
                }
            } else {      
                var b = allureReports[i].buildId;
                results[item].arr[b] = {
                    status: "NONE"
                }
            }
        }
        callback();
    }, function(err) {
        if (err) {
            console.log('Error in assigning test values ' + err);
        }
    });            
};
module.exports = AllureDiff;