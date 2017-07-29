module.exports = {
	url: 'http://localhost:9088/',
	elements: {
		nightliesList: by.testId('nightliesList'),
		lastExecutionsBtn: by.testId('lastExecutions_Buton'),

		errMsg: By.css('#home .error-message')
	},

	selectNightly: function(nighlyName) {
		var elm = driver.findElement(this.elements.nightliesList);
		return elm.findElement(by.xpath(`//*[contains(text(), '${nighlyName}')]/..`))
			.click()
				.then(page.appPO.waitForMainSpinner.bind(this))
		;
	},

	selectLastExecutions: function() {
		return driver.findElement(this.elements.lastExecutionsBtn)
			.click()
				.then(page.appPO.waitForMainSpinner.bind(this))
		;
	},

	getErrMsg: function() {
		return driver.findElement(this.elements.errMsg);
	}

};
