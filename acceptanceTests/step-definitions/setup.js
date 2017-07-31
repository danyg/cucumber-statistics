module.exports = function () {

	// add a before feature hook
	this.BeforeFeature(function(feature) {
		shared.featureStore = {};
		return page.appPO.startApp();
	});

	// add an after feature hook
	this.AfterFeature(function(feature) {
		return page.appPO.closeApp();
	});

	// add before scenario hook
	this.BeforeScenario(function(scenario) {
		shared.scenarioStore = {};
		page.scenarioPO.cleanScenarios();

		LOGGER.info('Starting Scenario: ' + scenario.getName());

		if(scenario.getTags().indexOf('@RestartServer') !== -1){
			return page.appPO.startApp();
		}
		return true;
	});

	// add after scenario hook
	this.AfterScenario(function(scenario) {
		return true
	});

};