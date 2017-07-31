module.exports = function() {

	this.When(/the user expands the "([^"]+)" scenario/, (scenarioName) => {
		return page.scenarioPO.getScenario(scenarioName)
			.expand()
		;
	});

	this.When(/the user colapses the "([^"]+)" scenario/, (scenarioName) => {
		return page.scenarioPO.getScenario(scenarioName)
			.collapse()
		;
	});

	this.Then(/^the user is presented with the option to "([^"]+)" the scenario$/, (optionName) => {
		return page.scenarioPO.currentScenario.getBtn(optionName)
			.then(btn => btn.getText())
			.then(text => assert.equal(
				text,
				optionName,
				"Button has not the expected label"
			))
		;
	});

	this.When(/^the user "([^"]+)" the scenario$/, (optionName) => {
		let scn = page.scenarioPO.currentScenario;

		let promise = shared.utilsSO.resolvedPromise();
		if(optionName === 'Mark as Fixed') {
			promise = page.lastExecutionsPO.getShowHiddenScenariosCount()
				.then(count => shared.scenarioStore.lastExecutionsHiddenScenarios = count)
			;
		}

		return promise
			.then(_ => scn.getBtn(optionName))
			.then(btn => btn.click())
		;
	});

	this.Then(/^the scenario gets hidden$/, () => {
		let scn = page.scenarioPO.currentScenario;

		return scn.getElement()
			.then(elm => elm.isDisplayed())
			.then(v => assert.isFalse(v, `Scenario ${scn.getName} should be hidden`))
		;
	});

	this.Then(/^the counter of hidden scenarios gets increased$/, () => {
		return page.lastExecutionsPO.getShowHiddenScenariosCount()
			.then(currentCount => {
				expect(currentCount)
					.to.be
					.above(
						shared.scenarioStore.lastExecutionsHiddenScenarios,
						'current count should be above the initial counter'
					)
			})
		;
	});

};
