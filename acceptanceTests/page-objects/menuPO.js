module.exports = {
	url: 'http://localhost:9088/',
	elements: {
		nightliesList: by.testId('nightliesList'),
		lastExecutionsBtn: by.testId('lastExecutions_Buton'),
		getNigtlyBtnByName: (nighlyName) => by.xpath(`//*[contains(text(), '${nighlyName}')]/..`),
		errMsg: By.css('#home .error-message')
	},

	selectNightly: function(nighlyName) {
		var elm = driver.findElement(this.elements.nightliesList);
		return elm.findElement(this.elements.getNigtlyBtnByName(nighlyName))
			.click()
				.then(_ => page.appPO.waitForMainSpinner())
		;
	},

	selectLastExecutions: function() {
		return driver.findElement(this.elements.lastExecutionsBtn)
			.click()
				.then(_ => page.appPO.waitForMainSpinner())
		;
	},

	getErrMsg: function() {
		return driver.findElement(this.elements.errMsg);
	}

};
