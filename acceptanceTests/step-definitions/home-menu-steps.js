module.exports = function() {

	this.When(/^the nightly "([^"]+)" is selected$/, function(nightlyName, done) {
		page.menuPO.selectNightly(nightlyName)
			.then(function() {
				done();
			})
		;
	});

	this.When(/^the last executions are selected$/, function(done) {
		page.menuPO.selectLastExecutions()
			.then(function() {
				done();
			})
		;
	});

};