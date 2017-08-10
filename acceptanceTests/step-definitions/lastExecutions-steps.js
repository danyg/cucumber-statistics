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
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	});

	this.When(/^the user hide the hidden scenarios$/, () => {
		return page.lastExecutionsPO.hideHiddenScenarios()
			.then(_ => shared.utilsSO.takeScreenshot())
		;
	});

	this.When(/^the user adds "([^"]+)" tag to "([^"]+)" tags$/, (tagName, action) => {
		let methodName = (action === 'included' ? 'includeTag' : 'excludeTag');
		return page.lastExecutionsPO[methodName](tagName);
	});

	this.Given(/^A user in Last Executions with "([^"]+)"$/, (dataScript) => {
		return Promise.resolve()
			.then(_ => shared.genericSteps.populateDB(dataScript))
			.then(_ => shared.genericSteps.userInApp())
			.then(_ => userGoesToLastExecutions())
		;
	});

};
