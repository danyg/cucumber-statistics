module.exports = function() {

	this.Given(/^A user is in cucumber statistics$/, shared.genericSteps.userInApp.bind(shared.genericSteps));

	this.Given(/^the database is empty$/, shared.genericSteps.wipeDB.bind(shared.genericSteps));

	this.Given(/^the database is populated with "([^"]+)"$/, shared.genericSteps.populateDB.bind(shared.genericSteps));

	this.Given(/^A user is in cucumber statistics with "([^"]+)"$/, function(dataScript, done) {
		return shared.genericSteps.populateDB(dataScript)
			.then(_ => shared.genericSteps.userInApp)
		;
	});

};
