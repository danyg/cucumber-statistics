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

module.exports = new GenericSteps();
