/**
 * This is the main class to request the json files and generate the diff
 * @author Eric Tam
 */

var request = require('request');
var AllureDiff = require('./AllureDiff');
var AllureParser = require('./AllureParser');
var async = require('async');

/**
 * Fetch 
 * @public
 * @return {boolean}
 */
var fetch = function(file, callback) {
	// Trim the URL to get a base Allure Report path and save the xunit.json
	//var allurePath = file.replace(/allure\/.*$/g, 'allure');
	var xunitFile = file + '/data/xunit.json';
	// Request a single xunit.json
	request.get(xunitFile, function(error, response, body) {

		// Check for errors
		if(error) {
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

		// If errors haven't occured, callback and parse the file
		var buildId = file.split("/")[5];
		callback(null, new AllureParser(body, file, buildId).simplifyReport());
	});
};
// Sort test results by build run from most recent to least recent



module.exports = {
	/**
	 * Fetch the json files asynchronuously and generate the diff after
	 * the fetch are done.
	 * @public
	 * @param {Array} The URLs that fetch the JSON files
	 * @param {Object} The response from the web server
	 * @param {Object} The template data that feeds into the handlebars templates
	 * @param {Function} The success callback function
	 * @param {Function} The failure callback function
	 */
	generateDiff : function(urls, res, template, success, failure) {
		//console.log(urls.length);

		// Using the aysnc library to ensure taht the json files are fetched asynchronuously
		async.map(urls, fetch, function(error, results) {
			if(error) {
				console.log('Error has occured: ' + error);
				failure(res, error)
				return;
			}
			var allureDiff = new AllureDiff().statusDiff(results);
			template.tests = allureDiff;
			success(res, template);
		});
	}
};