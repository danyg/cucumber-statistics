module.exports = function () {

	// add a before feature hook
	this.BeforeFeature(function(feature, done) {
		page.appPO.startApp()
			.then(_ => {
                done();
            })
		;
	});

	// add an after feature hook
	this.AfterFeature(function(feature, done) {
		page.appPO.closeApp()
            .then(_ => done())
        ;
		done();
	});

	// add before scenario hook
	this.BeforeScenario(function(scenario, done) {
		LOGGER.info('Starting Scenario: ' + scenario.getName());
		if(scenario.getTags().indexOf('@RestartServer') !== -1){

			page.appPO.startApp()
				.then(_ => page.appPO.newApp())
				.then(_ => done())
			;
		} else {
			done();
		}
	});

	// add after scenario hook
	this.AfterScenario(function(scenario, done) {
		if(scenario.getTags().indexOf('@DontStopServer'))
		LOGGER.info('AfterScenario: ' + scenario.getName());
		done();
	});

};