const {Condition} = require('selenium-webdriver');
until.elementIsNotPresent = function elementIsNotPresent(locator) {
	return new Condition('for no element to be located ' + locator, function(driver) {
		return driver.findElements(locator).then(function(elements) {
			return elements.length == 0;
		});
	});
};

By.testId = function(testid) {
	return by.css(`[data-testid="${testid}"]`);
}

module.exports = {
	camelize: function camelize(str) {
		return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
			return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
		}).replace(/\s+/g, '');
	}

}
