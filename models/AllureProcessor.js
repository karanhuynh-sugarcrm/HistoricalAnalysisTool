var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var main = require('./AllureDiffMain');
var fs = require('fs');

/*
@constructor 
@param{string} Jenkins URL with all the build runs for the project 
*/

function AllureProcessor(url) {
	this.url = "http://eng-ci1.sjc.sugarcrm.pvt:8080/job/" + url;
}
AllureProcessor.prototype.genReports = function(res, home, successRes, errorRes) {
	var allureURLS = [];
	// Gets all the allure URLS
	var fetch = function(file, cb) {
		request(file, function(err, resp, html) {
			if (!err) {
				var $ = cheerio.load(html);
				$('#buildHistory .build-row a').each(function(i, link) {
					if ($(link).attr('href').indexOf('allure') !== -1) {
						var cur = ($(link).attr('href'));
						allureURLS.push(cur);
					}
				});				
			}
			cb(null, allureURLS);
		});
	}	
	async.map([this.url], fetch, function(err, result) {	
		if(err) {
			console.log("ERRROR D;" + err);
		} else {
			var urls = result[0].slice(0, home.numRuns)
			main.generateDiff(
				urls,
				res,
				home,
				successRes,
				errorRes
			);
		}
	});
}
module.exports = AllureProcessor;