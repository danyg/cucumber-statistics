module.exports = function() {



	this.Then(/^the user is presented with the Filter Tags component$/, function(){
		return page.lastExecutionsPO.getFiltersContainer();
	});

	function userGoesToLastExecutions() {
		return page.menuPO.selectLastExecutions();
	}
	this.When(/^the last executions are selected$/, userGoesToLastExecutions);

	this.Given(/^A user in Last Executions with "([^"]+)"$/, (dataScript) => {
		return shared.genericSteps.userInApp()
			.then(_ => shared.genericSteps.populateDB(dataScript))
			.then(_ => userGoesToLastExecutions())
		;
	});

};
