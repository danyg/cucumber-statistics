module.exports = {
	url: 'http://localhost:9088/',
	elements: {
		nightliesList: by.testId('nightliesList'),
		lastExecutionsBtn: by.testId('lastExecutions_Buton'),
		getNigtlyBtnByName: (nighlyName) => by.xpath(`//*[contains(text(), '${nighlyName}')]/..`),
		errMsg: By.css('#home .error-message')
	},

	selectNightly: function(nighlyName) {
		LOGGER.debug(`Opening Nightly page for "${nighlyName}"...`);
		var elm = driver.findElement(this.elements.nightliesList);
		return elm.findElement(this.elements.getNigtlyBtnByName(nighlyName))
			.click()
				.then(_ => page.appPO.waitForMainSpinner())
				.then(_ => LOGGER.debug(`Nightly page for "${nighlyName}" ready to be used.`));
		;
	},

	selectLastExecutions: function() {
		LOGGER.debug('Opening Last Executions page...');
		return driver.findElement(this.elements.lastExecutionsBtn)
			.click()
				.then(_ => page.appPO.waitForMainSpinner())
				.then(_ => LOGGER.debug(`Last Executions page ready to used.`));
		;
	},

	getErrMsg: function() {
		return driver.findElement(this.elements.errMsg);
	}

};
