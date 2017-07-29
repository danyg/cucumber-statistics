module.exports = {
	url: 'http://localhost:9088/',
	elements: {
		nightliesList: by.testId('nightliesList'),
		lastExecutionsBtn: by.testId('lastExecutions_Buton')
	},

	selectNightly: function(nighlyName) {
		var elm = driver.findElement(this.elements.nightliesList);
		return elm.findElement(by.xpath(`//*[contains(text(), '${nighlyName}')]/..`))
			.click()
				.then(this.waitForMainSpinner.bind(this))
		;
	},

	selectLastExecutions: function() {
		return driver.findElement(this.elements.lastExecutionsBtn)
			.click()
				.then(this.waitForMainSpinner.bind(this))
		;
	},

	waitForMainSpinner: function() {
		return driver.wait(until.elementLocated(by.testId('mainLoading_spinner')))
			.then(function(spinner) {
				spinner.isDisplayed().then(v => assert.isTrue(v, 'The spinner should be displayed.'));
				return driver.wait(until.elementIsNotVisible(spinner)).catch(_ => true);
			})
		;
	}
};
