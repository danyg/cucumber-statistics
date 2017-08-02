module.exports = function() {

	this.Then(/^the user is presented with the Filter Tags component$/, function(){
		return page.lastExecutionsPO.getFiltersContainer();
	});

	function userGoesToLastExecutions() {
		return page.menuPO.selectLastExecutions();
	}
	this.When(/^the last executions are selected$/, userGoesToLastExecutions);

	this.When(/^the user show the hidden scenarios$/, () => {
		return page.lastExecutionsPO.showHiddenScenarios()
			.then(_ => driver.takeScreenshot())
		;
	});

	this.When(/^the user hide the hidden scenarios$/, () => {
		return page.lastExecutionsPO.hideHiddenScenarios()
			.then(_ => driver.takeScreenshot())
		;
	});

	this.Given(/^A user in Last Executions with "([^"]+)"$/, (dataScript) => {
		return shared.genericSteps.userInApp()
			.then(_ => shared.genericSteps.populateDB(dataScript))
			.then(_ => userGoesToLastExecutions())
		;
	});

};
