var AllureProcessor = require('../models/allureProcessor');
var AllureParser = require('../models/AllureParser');
var HistoricalData = require('../models/HistoricalData');
var helper = require('./convertJSON');
var expect = require('chai').expect;

function setupAllureReports(path1, path2, singleTest) {
	var allureReports = [];
	var run1 = new AllureParser(helper.readFile('./test/test-data/' + path1), '200').simplifyReport();
	var run2 = new AllureParser(helper.readFile('./test/test-data/' + path2), '100').simplifyReport();
	allureReports.push(run1);
	allureReports.push(run2);
	return new HistoricalData(allureReports, singleTest).statusDiff();
}
function setupMultiAllureReports(path1, path2, path3, path4) {
	var allureReports = [];
	var run1 = new AllureParser(helper.readFile('./test/test-data/' + path1), '400').simplifyReport();
	var run2 = new AllureParser(helper.readFile('./test/test-data/' + path2), '300').simplifyReport();
	var run3 = new AllureParser(helper.readFile('./test/test-data/' + path3), '200').simplifyReport();
	var run4 = new AllureParser(helper.readFile('./test/test-data/' + path4), '100').simplifyReport();
	allureReports.push(run1);
	allureReports.push(run2);
	allureReports.push(run3);
	allureReports.push(run4);
	return new HistoricalData(allureReports).statusDiff();
}
function statusCheck(results, name, status, build) {
	it('should have the correct status', function() {
		expect(results[name].arr[build].status).to.equal(status);
	});
}
function statCheck(results, name, stat) {
	expect(results[name].stat).to.equal(stat);
}
function stableCheck(results) {
	it('should return stat 100', function() {
		expect(results['RevenueLineItems_26114'].stat).to.equal(100);
	});
}
function sameStatus(results) {
	it('should have the same test status', function() {
		var stat = results['RevenueLineItems_26114'].arr[200].status;
		expect(results['RevenueLineItems_26114'].arr[100].status).to.equal(stat);
	});
}
function zeroResults(results) {
	it('should return zero test results', function() {
		expect(results.resultsFound).to.equal(0);
	});
}
function unstableCheck(results, name, percent) {
	it('should return stat 0', function() {
		expect(results[name].stat).to.equal(percent);
	});
}
describe('HistoricalData.js', function() {

	describe('Single Test Search', function() {
		var results;
		it('should contain one test result', function() {
			results = setupAllureReports('passed.json', 'passed.json', 'RevenueLineItems_26114');
			expect(results).to.contain.all.keys(['RevenueLineItems_26114']);
			expect(results.resultsFound).to.equal(1);
		});
		it('should contain two build ID results', function() {
			results = setupAllureReports('passed.json', 'passed.json', 'RevenueLineItems_26114');
			expect(results['RevenueLineItems_26114'].arr).to.contain.all.keys('100', '200');
		});

		it('should contain zero test results for invalid single test search', function() {
			results = setupAllureReports('passed.json', 'passed.json', 'invalidSearch');
			expect(results.resultsFound).to.equal(0);
		});
		it('should contain name, stability, status', function() {
			results = setupAllureReports('passed.json', 'passed.json', 'RevenueLineItems_26114');
			expect(results['RevenueLineItems_26114']).to.contain.all.keys(['name', 'stat', 'arr']);
			expect(results['RevenueLineItems_26114'].arr[100].status).to.equal('PASSED');
		});

		describe('-Stable-', function() {
			describe('PASSED to PASSED', function() {
				results = setupAllureReports('passed.json', 'passed.json', 'RevenueLineItems_26114');
				sameStatus(results);
				stableCheck(results);
			});
			describe('PENDING to PENDING', function() {
				results = setupAllureReports('pending.json', 'pending.json', 'RevenueLineItems_26114');
				sameStatus(results);
				stableCheck(results);
			});
			describe('BROKEN to BROKEN', function() {
				results = setupAllureReports('broken.json', 'broken.json', 'RevenueLineItems_26114');
				sameStatus(results);
				stableCheck(results);
			});
			describe('FAILED to FAILED', function() {
				results = setupAllureReports('failed.json', 'failed.json', 'RevenueLineItems_26114');
				sameStatus(results);
				stableCheck(results);
			});
			describe('PENDING to PASSED', function() {
				results = setupAllureReports('pending.json', 'passed.json', 'RevenueLineItems_26114');
				stableCheck(results);
			});
			describe('PASSED to PENDING', function() {
				results = setupAllureReports('passed.json', 'pending.json', 'RevenueLineItems_26114');
				stableCheck(results);
			});
			describe('PENDING to NONE', function() {
				results = setupAllureReports('pending.json', 'none.json', 'RevenueLineItems_26114');
				stableCheck(results);
			});
			describe('FAILED to BROKEN', function() {
				results = setupAllureReports('failed.json', 'broken.json', 'RevenueLineItems_26114');
				stableCheck(results);
			});
			describe('BROKEN to FAILED', function() {
				results = setupAllureReports('broken.json', 'failed.json', 'RevenueLineItems_26114');
				stableCheck(results);
			});
		});
		describe('-Unstable-', function() {
			describe('BROKEN to PASSED', function() {
				results = setupAllureReports('broken.json', 'passed.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
			describe('BROKEN to NONE', function() {
				results = setupAllureReports('broken.json', 'none.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
			describe('BROKEN to PENDING', function() {
				results = setupAllureReports('broken.json', 'pending.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
			describe('FAILED to PASSED', function() {
				results = setupAllureReports('failed.json', 'passed.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
			describe('FAILED to NONE', function() {
				results = setupAllureReports('failed.json', 'none.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
			describe('FAILED to PENDING', function() {
				results = setupAllureReports('failed.json', 'pending.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
			describe('PASSED to BROKEN', function() {
				results = setupAllureReports('passed.json', 'broken.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
			describe('PASSED to FAILED', function() {
				results = setupAllureReports('passed.json', 'failed.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
			describe('PENDING to BROKEN', function() {
				results = setupAllureReports('pending.json', 'broken.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
			describe('PENDING to FAILED', function() {
				results = setupAllureReports('pending.json', 'failed.json', 'RevenueLineItems_26114');
				unstableCheck(results, 'RevenueLineItems_26114', 0);
			});
		});	

	});
	describe('Multiple Test Search', function() {
		var results;
		it('should contain three test results', function() {
			results = setupMultiAllureReports('multi-passed.json', 'multi-broken.json', 'multi-pending.json', 'multi-failed.json');
			expect(results).to.contain.all.keys(['Calendar_20346_Meetings_execute', 'Calendar_20346_Meetings_test', 'Calendar_20346_Calls_execute']);
			expect(results.resultsFound).to.equal(3);
		});
		it('should contain four build ID results', function() {
			results = setupMultiAllureReports('multi-passed.json', 'multi-broken.json', 'multi-pending.json', 'multi-failed.json');
			expect(results['Calendar_20346_Meetings_execute'].arr).to.contain.all.keys('100', '200', '300', '400');
			expect(results['Calendar_20346_Meetings_test'].arr).to.contain.all.keys('100', '200', '300', '400');
			expect(results['Calendar_20346_Calls_execute'].arr).to.contain.all.keys('100', '200', '300', '400');

		});
		it('should contain name, stability, status for each test', function() {
			results = setupMultiAllureReports('multi-passed.json', 'multi-broken.json', 'multi-pending.json', 'multi-failed.json');
			expect(results['Calendar_20346_Meetings_execute']).to.contain.all.keys(['name', 'stat', 'arr']);
			expect(results['Calendar_20346_Meetings_test']).to.contain.all.keys(['name', 'stat', 'arr']);
			expect(results['Calendar_20346_Calls_execute']).to.contain.all.keys(['name', 'stat', 'arr']);
		});

		describe('-Stable-', function() {
				describe('PASSED to PASSED', function() {
					results = setupAllureReports('passed.json', 'passed.json');
					zeroResults(results);
				});
				describe('PENDING to PENDING', function() {
					results = setupAllureReports('pending.json', 'pending.json');
					zeroResults(results);
				});
				describe('BROKEN to BROKEN', function() {
					results = setupAllureReports('broken.json', 'broken.json');
					zeroResults(results);
				});
				describe('FAILED to FAILED', function() {
					results = setupAllureReports('failed.json', 'failed.json');
					zeroResults(results);
				});
				describe('NONE to NONE to NONE to PASSED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-none.json', 'multi-none.json', 'multi-none.json');
					zeroResults(results);
			
				});
				describe('NONE to NONE to NONE to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-none.json', 'multi-none.json', 'multi-none.json');
					zeroResults(results);
			
				});
				describe('PASSED to PASSED to PASSED to PASSED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-passed.json', 'multi-passed.json', 'multi-passed.json');
					zeroResults(results);
			
				});
		});
		describe('-Unstable 0% Stability-', function() {
			var results;
				describe('BROKEN to PASSED', function() {
					results = setupAllureReports('broken.json', 'passed.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('BROKEN to NONE', function() {
					results = setupAllureReports('broken.json', 'none.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('BROKEN to PENDING', function() {
					results = setupAllureReports('broken.json', 'pending.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('FAILED to PASSED', function() {
					results = setupAllureReports('failed.json', 'passed.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('FAILED to NONE', function() {
					results = setupAllureReports('failed.json', 'none.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('FAILED to PENDING', function() {
					results = setupAllureReports('failed.json', 'pending.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('PASSED to BROKEN', function() {
					results = setupAllureReports('passed.json', 'broken.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('PASSED to FAILED', function() {
					results = setupAllureReports('passed.json', 'failed.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('PENDING to BROKEN', function() {
					results = setupAllureReports('pending.json', 'broken.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('PENDING to FAILED', function() {
					results = setupAllureReports('pending.json', 'failed.json');
					unstableCheck(results, 'RevenueLineItems_26114', 0);
				});
				describe('PASSED to BROKEN to PENDING to FAILED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-broken.json', 'multi-pending.json', 'multi-failed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 0);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 400);
			
				});
				describe('PASSED to BROKEN to PENDING to FAILED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-broken.json', 'multi-pending.json', 'multi-failed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 0);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 400);
			
				});
				describe('PENDING to BROKEN to PENDING to FAILED', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-broken.json', 'multi-pending.json', 'multi-failed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 0);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
				describe('PASSED to FAILED to PENDING to FAILED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-failed.json', 'multi-pending.json', 'multi-failed.json');
				
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 0);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 400);
			
				});
				describe('FAILED to PENDING to FAILED to PENDING', function() {
					results = setupMultiAllureReports('multi-failed.json', 'multi-pending.json', 'multi-failed.json', 'multi-pending.json');
					
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 0);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 400);
			
				});
				describe('FAILED to NONE to FAILED to NONE', function() {
					results = setupMultiAllureReports('multi-failed.json', 'multi-none.json', 'multi-failed.json', 'multi-none.json');
				
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 0);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 400);
			
				});
				describe('FAILED to PASS to FAILED to PASS', function() {
					results = setupMultiAllureReports('multi-failed.json', 'multi-passed.json', 'multi-failed.json', 'multi-passed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 0);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 400);
			
				});
		});
		describe('-Unstable 33% Stability-', function() {
			var results;
				describe('PASSED to FAILED to PASSED to PASSED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-passed.json', 'multi-failed.json', 'multi-passed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 400);
			
				});
				describe('PASSED to BROKEN to PASSED to PASSED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-passed.json', 'multi-broken.json', 'multi-passed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 400);
			
				});
				describe('PASSED to PASSED to FAILED to PASSED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-failed.json', 'multi-passed.json', 'multi-passed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 400);
			
				});
				describe('PASSED to PASSED to BROKEN to PASSED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-broken.json', 'multi-passed.json', 'multi-passed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 400);
			
				});
				describe('PENDING to FAILED to PENDING to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-pending.json', 'multi-failed.json', 'multi-pending.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
				describe('PENDING to BROKEN to PENDING to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-pending.json', 'multi-broken.json', 'multi-pending.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
				describe('PENDING to PENDING to FAILED to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-failed.json', 'multi-pending.json', 'multi-pending.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
				describe('PENDING to PENDING to BROKEN to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-broken.json', 'multi-pending.json', 'multi-pending.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
				describe('NONE to FAILED to NONE to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-none.json', 'multi-failed.json', 'multi-none.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
				describe('NONE to BROKEN to NONE to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-none.json', 'multi-broken.json', 'multi-none.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
				describe('NONE to NONE to FAILED to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-failed.json', 'multi-none.json', 'multi-none.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
				describe('NONE to NONE to BROKEN to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-broken.json', 'multi-none.json', 'multi-none.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 33);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
			
		});
		describe('-Unstable 66% Stability-', function() {
			var results;
				describe('NONE to NONE to NONE to FAILED', function() {
					results = setupMultiAllureReports('multi-failed.json', 'multi-none.json', 'multi-none.json', 'multi-none.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 400);
			
				});
				describe('NONE to NONE to NONE to BROKEN', function() {
					results = setupMultiAllureReports('multi-broken.json', 'multi-none.json', 'multi-none.json', 'multi-none.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'NONE', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 400);
			
				});
				describe('PASSED to PASSED to PASSED to FAILED', function() {
					results = setupMultiAllureReports('multi-failed.json', 'multi-passed.json', 'multi-passed.json', 'multi-passed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 400);
			
				});
				describe('PASSED to PASSED to PASSED to BROKEN', function() {
					results = setupMultiAllureReports('multi-broken.json', 'multi-passed.json', 'multi-passed.json', 'multi-passed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 400);
			
				});
				describe('PENDING to PENDING to PENDING to FAILED', function() {
					results = setupMultiAllureReports('multi-failed.json', 'multi-pending.json', 'multi-pending.json', 'multi-pending.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 400);
			
				});
				describe('PENDING to PENDING to PENDING to BROKEN', function() {
					results = setupMultiAllureReports('multi-broken.json', 'multi-pending.json', 'multi-pending.json', 'multi-pending.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 400);
			
				});
				describe('FAILED to PASSED to PASSED to PASSED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-passed.json', 'multi-passed.json', 'multi-failed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 400);
			
				});
				describe('BROKEN to PASSED to PASSED to PASSED', function() {
					results = setupMultiAllureReports('multi-passed.json', 'multi-passed.json', 'multi-passed.json', 'multi-broken.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PASSED', 400);
			
				});
				describe('FAILED to PENDING to PENDING to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-pending.json', 'multi-pending.json', 'multi-failed.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'FAILED', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});
				describe('BROKEN to PENDING to PENDING to PENDING', function() {
					results = setupMultiAllureReports('multi-pending.json', 'multi-pending.json', 'multi-pending.json', 'multi-broken.json');
					unstableCheck(results, 'Calendar_20346_Meetings_execute', 66);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'BROKEN', 100);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 200);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 300);
					statusCheck(results, 'Calendar_20346_Meetings_execute', 'PENDING', 400);
			
				});

		});
	});
	
});
