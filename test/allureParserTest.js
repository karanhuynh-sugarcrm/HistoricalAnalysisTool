var AllureProcessor = require('../models/allureProcessor');
var AllureParser = require('../models/AllureParser');
var helper = require('./convertJSON');
var expect = require('chai').expect;

describe('AllureParser.js', function() {
	var allureParser;
	before(function() {
    	allureParser = new AllureParser(helper.readFile('./test/test-data/passed.json'));
    });

    it('contains the correct fields - start, end and duration', function() {
    	expect(allureParser.getTimeData()).to.have.all.keys('start', 'stop', 'duration');
  	});

  	it('contains the right uid for the first test in the testSuites', function() {
    	expect(allureParser.getTestSuiteData()[0].uid).to.equal('d13e5f4e1b89cc35');
  	});

  	describe('generates the correct single simplified report', function() {
	    var allureParser, simplifiedReport;
	    before(function() {
	      allureParser = new AllureParser(helper.readFile('./test/test-data/passed.json'), '222');
	      simplifiedReport = allureParser.simplifyReport();
    	});

    	it('contains exactly one test case', function() {
      		expect(simplifiedReport).to.contain.all.keys(["RevenueLineItems_26114"]);
    	});

    	it('contains the test case status PASSED', function() {
      		expect(simplifiedReport["RevenueLineItems_26114"].status).to.equal('PASSED');
    	});

    	it('contains the test case build ID 222', function() {
      		expect(simplifiedReport["RevenueLineItems_26114"].buildId).to.equal('222');
    	});
    });

    describe('generates the correct multiple test cases per test simplified report', function() {
	    var allureParser, simplifiedReport;
	    before(function() {
	      allureParser = new AllureParser(helper.readFile('./test/test-data/multi-test.json'), '200');
	      simplifiedReport = allureParser.simplifyReport();
    	});

    	it('Take names of Test Cases name field and not Test Name field', function() {
      		expect(simplifiedReport).to.contain.all.keys(["Calendar_20346_Meetings_execute", "Calendar_20346_Meetings_test", "Calendar_20346_Calls_execute"]);
    	});

    	it('contains the test case statuses PENDING, BROKEN, FAILED', function() {
      		expect(simplifiedReport["Calendar_20346_Meetings_execute"].status).to.equal('PENDING');
      		expect(simplifiedReport["Calendar_20346_Meetings_test"].status).to.equal('BROKEN');
      		expect(simplifiedReport["Calendar_20346_Calls_execute"].status).to.equal('FAILED');
    	});

    	it('contains the test case build ID 200', function() {
      		expect(simplifiedReport["Calendar_20346_Calls_execute"].buildId).to.equal('200');
    	});
    });

    it('throws exception when the JSON does not adhere to xunit.json format', function() {
	    var allureParserConstructor = function(){new AllureParser(helper.readFile('./test/test-data/fake.json'));};
	    expect(allureParserConstructor).to.throw(/is not a xunit.json from Allure Report/);
  });
});