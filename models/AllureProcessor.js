/*
Handles the preprocessing to generate the test results for multiple test runs
*/
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var AllureParser = require('./AllureParser');
var HistoricalData = require('./HistoricalData')
/*
@constructor 
@param {string} Jenkins URL with all the build runs for the project 
*/
function AllureProcessor(url) {
	this.url = "http://eng-ci1.sjc.sugarcrm.pvt:8080/job/" + url;
}
/*
Checks if allure report is valid 
Extracts individual test results including build ID, test name, status, link to stack trace
@private
@param {string} Allure report URL 
*/
var simplifyAllure = function(file, callback) {
	var xunitFile = file + '/data/xunit.json';
	// Process single test run
	request.get(xunitFile, function(err, response, body) {
		// Error checking
		if(err) {
			console.log('Error has occured: ' + err);
			callback(error);
			return;
		}
		if(response.statusCode !== 200) {
			callback('Invalid Status Code has returned ' + response.statusCode);
			return;
		}
		if(response.headers['content-type'] !== 'application/json') {
			callback('Invalid Content Type. It should be application/json');
			return;
		}
		// Save the build ID
		var buildId = file.split("/")[5];
		// Parse valid allure report
		callback(null, new AllureParser(body, buildId, file).simplifyReport());
	});
};
/*
Saves allure URLS on a page
@param {string} Jenkins Job URL 
@private
*/
var fetchURLS = function(file, cb) {
	var allureURLS = [];
		request(file, function(err, resp, html) {
			if (!err) {
				var $ = cheerio.load(html);
				$('#buildHistory .build-row a').each(function(i, link) {
					if ($(link).attr('href').indexOf('allure') !== -1) {
						var cur = ($(link).attr('href'));
						allureURLS.push(cur);
					}
				});				
			} else {
				console.log(err);
			}
			cb(null, allureURLS);
		});
	}	
/*
Asynchronously saves all the available allure reports for the specified job name to
asynchronously parses allure reports and generate the test results accross specified number of test runs
or a specific single test
@public
@param {Object} The response from the web server
@param {Object} The template data that feeds into the handlebars templates
@param {Function} The success callback function
@param {Function} The failure callback function 
*/
AllureProcessor.prototype.genReports = function(res, home, successRes, errorRes) {
	async.map([this.url], fetchURLS, function(err, results) {	
		if (err) {
			console.log(err);
		} else {
			// Specified number of test run results to return
			var urls = results[0].slice(0, home.numRuns);
			async.map(urls, simplifyAllure, function(err, results) {
				// Error checking
				if (err) {
					console.log('Error has occured: ' + err);
					errorRes(res, error);
					return;
				// Single test processing
				} else if (home.singleTestSearch) {
					home.tests = new HistoricalData(results, home.singleTestSearch).statusDiff();
				}
				// Unstable test processing
				else {
					home.tests = new HistoricalData(results).statusDiff();
				}
				successRes(res, home);
			});
		}
	});
}
module.exports = AllureProcessor;