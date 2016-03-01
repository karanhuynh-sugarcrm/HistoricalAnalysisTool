var express = require('express');
var router = express.Router();
var AllureProcessor = require('../models/AllureProcessor');

router.get('/', function (req, res) {
    res.render('home');

});
router.post('/results', function(req, res) {

	var numRuns = req.body.numRuns;
	var jobName = req.body.jobName;
	var singleTestSearch = req.body.singleTestSearch;
	var allureProcessor = new AllureProcessor(jobName).genReports(
		res, 
		{numRuns : numRuns, 
		 jobName : jobName, 
		 singleTestSearch : singleTestSearch}, 
		function(res, results) {
		res.render('home', results);}, 
		function(res, error) {
			console.log("error");
			res.status(500);
			res.redirect('/');}
	);
});

module.exports = router;