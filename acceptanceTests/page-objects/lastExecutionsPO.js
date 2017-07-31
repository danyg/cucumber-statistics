module.exports = {
	url: 'http://localhost:9088/',
	elements: {
		filterComponent: by.testId('filters_container'),
		showHiddenScenariosLabel: by.testId('allFailedScenariosInLastExecution_hiddenScenarios_label'),
		showHiddenScenariosCheckbox: by.testId('allFailedScenariosInLastExecution_hiddenScenarios_checkbox'),
		showHiddenScenariosCounter: by.testId('allFailedScenariosInLastExecution_hiddenScenarios_counter'),
	},

	getFiltersContainer: function() {
		return driver.findElement(this.elements.filterComponent)
			.catch(_ => assert.fail(
				0,1,
				'Filter Container not Found with testId filters_container'
			))
		;
	},

	getShowHiddenScenariosCount: function() {
		return driver.findElement(this.elements.showHiddenScenariosCounter)
			.getText()
		;
	}

}