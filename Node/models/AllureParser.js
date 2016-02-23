
/**
 * @constructor
 * @param {string} xunit.json data in string
 * @param {string} The url of xunit.json
 */
var simplifiedTestResults = []; 
function AllureParser(fileContent, uri, buildId) {
    this.report = JSON.parse(fileContent);
    this.uri = uri;
    this.buildId = buildId;
    if(!this.checkIfAllure()) {
        throw 'The JSON file is not a xunit.json from Allure Report';
    }
}

/**
 * Check if the report is in xunit.json format
 * @public
 * @return {boolean}
 */
AllureParser.prototype.checkIfAllure = function() {
    return checkIfDefined(this.getTimeData()) &&
        checkIfDefined(this.getTestSuiteData()) &&
        checkIfDefined(this.getTimeData().duration);
};

/**
 * Return the time data of the Allure Report
 * @public
 * @return {Object}
 */
AllureParser.prototype.getTimeData = function() {
    return this.report.time;
};

/**
 * Return the test suites data of the Allure Report
 * @public
 * @return {Object}
 */
AllureParser.prototype.getTestSuiteData = function() {
    return this.report.testSuites;

};

/**
 * Simplify the xunit.json report into details we concern
 * @public
 * @return {Object} Key: Test Name; Value: An object that contains the
 * test cases as created in simplifyTestCases()
 */
AllureParser.prototype.simplifyReport = function() {
    var testSuites = this.getTestSuiteData();
    var simplifiedTestResults = {};
    for(var i = 0, len = testSuites.length; i < len; i++) {
        var numTests = testSuites[i].testCases.length;
        if (numTests == 1) {
            var testName = getClassNameFromPackage(testSuites[i].name);
            var testCases = testSuites[i].testCases[0];
            simplifiedTestResults[testName] = simplifyTestCases(this.uri, testSuites[i].uid, testCases, this.buildId);
        } else {
            // account for multiple testcase a test where names need to be unique
            for(var ii = 0; ii < numTests; ii++) {
                var testName = testSuites[i].testCases[ii].name;
                var testCases = testSuites[i].testCases[ii];
                simplifiedTestResults[testName] = simplifyTestCases(this.uri, testSuites[i].uid, testCases, this.buildId);

            } 
        }
        simplifiedTestResults.buildId = this.buildId;
        /* !@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 
        if (testName+"_execute" !== (testSuites[i].testCases[0].name) && testSuites[i].testCases[0].name !== "execute") {
            console.log(testSuites[i]);
        } */  
    }
    return simplifiedTestResults;
};

/**
 * Given the test cases of a test, create a map between each test cases
 * and its url and status
 * @private
 * @return {Object} Key: Test Case Name; Value: An object that represents url
 * that links to th test case and the status of the test case
 */
function simplifyTestCases(uri, testSuiteUid, testCases, buildId) {
    // HERE IS WHERE I ACCOUNT FOR MORE INFO EX. TIME && SEVERITY
    var simplifiedTestCases = {};
        simplifiedTestCases = {
            'uri' : uri + '/#/xunit/' + testSuiteUid + '/' + testCases.uid,
            'status' : testCases.status,
            'buildId' : buildId,
        };
    return simplifiedTestCases;
}

/**
 * Check if the field is unefined
 * @private
 * return {boolean}
 */
function checkIfDefined(field) {
    return field !== undefined;
}

/**
 * Get the class name of a Java package
 * @private
 * return {String} the Java class name
 */
function getClassNameFromPackage(packageName) {
    return packageName.substring(packageName.lastIndexOf('.') + 1);
}

module.exports = AllureParser;