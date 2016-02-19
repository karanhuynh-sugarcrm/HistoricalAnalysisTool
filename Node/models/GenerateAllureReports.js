var request = require('request');
var cheerio = require('cheerio');
var HashMap = require('hashmap');

var allureURLS = new HashMap();
var xunit = "/data/xunit.json";
var defects = "/data/defects.json";

var url = 'http://eng-ci1.sjc.sugarcrm.pvt:8080/job/7700_Voodoo_Tests/'
request(url, function(err, resp, html) {
	if (!err) {
		
	var $ = cheerio.load(html);
	//links = $('a');
		$('#buildHistory .build-row a').each(function(i, link) {
		//var str = $(link).attr('href');
			if ($(link).attr('href').indexOf('allure') != -1) {
				var cur = ($(link).attr('href'));
				allureURLS.set((cur + xunit), (cur + defects));
			}
		});
		
	}
	
	try {

		allureURLS.forEach(function(value, key) {
			var breakException = value;
			request(key, function(err, resp, body) {
				console.log(body);
			});
			throw breakException;
		});
	} catch(e) {
		console.log(e);
	}

});