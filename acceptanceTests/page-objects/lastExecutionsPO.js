class LastExecutionsPO {
	constructor() {
		this.elements = {
			filterComponent: By.testId('filters_container'),
			showHiddenScenariosLabel: By.testId('allFailedScenariosInLastExecution_hiddenScenarios_label'),
			showHiddenScenariosCheckbox: By.testId('allFailedScenariosInLastExecution_hiddenScenarios_checkbox'),
			showHiddenScenariosCounter: By.testId('allFailedScenariosInLastExecution_hiddenScenarios_counter'),
		}

		shared.POHelper.onBeforeScenario(this.cleanStatus.bind(this));
	}

	cleanStatus() {
		this._lastHiddenScenarioStatus = null;
	}

	getFiltersContainer() {
		return driver.findElement(this.elements.filterComponent)
			.catch(_ => assert.fail(
				0,1,
				'Filter Container not Found with testId filters_container'
			))
		;
	}

	getShowHiddenScenariosCount() {
		return driver.findElement(this.elements.showHiddenScenariosCounter)
			.getText()
		;
	}

	storeHiddenScenarioStatus() {
		return driver.findElement(this.elements.showHiddenScenariosCheckbox)
			.then(chkbx => {
				return chkbx.isSelected()
					.then(s => this._lastHiddenScenarioStatus = s)
			})
		;
	}

	restoreHiddenScenarioStatus() {
		if(this._lastHiddenScenarioStatus === null) {
			throw new Error('trying to restoreHiddenScenarioStatus without caling storeHiddenScenarioStatus in beforehand');
		}
		return this._lastHiddenScenarioStatus ? this.showHiddenScenarios() : this.hideHiddenScenarios();
	}

	showHiddenScenarios() {
		return driver.findElement(this.elements.showHiddenScenariosCheckbox)
			.then(chkbx => {
				return chkbx.isSelected()
					.then(s => assert.isFalse(s, 'Expecting scenarios to be hidden!'))
					.then(_ => chkbx.click())
			})
		;
	}

	hideHiddenScenarios() {
		return driver.findElement(this.elements.showHiddenScenariosCheckbox)
			.then(chkbx => {
				return chkbx.isSelected()
					.then(s => assert.isTrue(s, 'Expecting scenarios to be shown!'))
					.then(_ => chkbx.click())
			})
		;
	}
}

module.exports = new LastExecutionsPO();
