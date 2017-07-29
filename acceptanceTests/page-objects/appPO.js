module.exports = {
	url: 'http://localhost:9088/',

	open: function() {
		return helpers.loadPage(this.url)
		 	.then(function() {
		 		return driver.wait(until.elementIsNotPresent(by.css('[data-testid="initial_spinner"]')))
		 	})
		;
	},

	getContainer: function(containerTitle) {
		var testId = shared.utilsSo.camelize(containerTitle) + '_container';
		return driver.findElement(by.css(`[data-testid="${testId}"]`))
			.catch(
				_ => assert.fail(testId,'', `Container "${containerTitle}" with testId ${testId} not found!`)
			)
		;
	},

	getContainerTitleText: function(containerTitle) {
		var testId = shared.utilsSo.camelize(containerTitle) + '_containerTitle';
		return driver.findElement(by.testId(testId))
			.then(elm => {
				return elm.getText();
			})
			.catch(
				_ => assert.fail(testId,'', `Title Element for "${containerTitle}" with testId ${testId} not found!`)
			)
		;
	}
};