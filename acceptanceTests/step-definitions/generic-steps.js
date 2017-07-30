class GenericSteps {
	userInApp() {
		return page.appPO.open();
	}

	wipeDB (){
		return shared.databaseSO.wipeDatabase();
	}

	populateDB (dataScript) {
		return this.wipeDB()
			.then(shared.databaseSO.fillDatabaseWith(
				shared.utilsSO.camelize(dataScript)
			))
		;
	}
}

const steps = new GenericSteps();

module.exports = function() {

	this.Given(/^A user is in cucumber statistics$/, steps.userInApp.bind(steps));

	this.Given(/^the database is empty$/, steps.wipeDB.bind(steps));

	this.Given(/^the database is populated with "([^"]+)"$/, steps.populateDB.bind(steps));

	this.Given(/^A user is in cucumber statistics with "([^"]+)"$/, function(dataScript, done) {
		return steps.populateDB(dataScript)
			.then(_ => steps.userInApp)
		;
	});

};
