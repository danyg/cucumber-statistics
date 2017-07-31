const Logger = require('../../core/Logger');
global.LOGGER = new Logger('acceptanceTests');

const {Condition} = require('selenium-webdriver');
until.elementIsNotPresent = function elementIsNotPresent(locator) {
	return new Condition('for no element to be located ' + locator, function(driver) {
		return driver.findElements(locator).then(function(elements) {
			return elements.length == 0;
		});
	});
};

By.testId = (testid) => by.css(`[data-testid="${testid}"]`);
By.testClass = (testClass) => by.css(`[data-testclass="${testClass}"]`);

process.on('unhandledRejection', r => LOGGER.error('unhandledRejection\n\t', r));

// LOGGER.debug('DEBUG!!!')
// LOGGER.info('INFO!!!')
// LOGGER.warn('WARN!!!')
// LOGGER.error('Error!!!')

module.exports = {
	camelize: function camelize(str, firstUpper) {
		return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
			return index == 0 ? letter[firstUpper ? 'toUpperCase' : 'toLowerCase']() : letter.toUpperCase();
		}).replace(/\s+/g, '');
	},

	onShutdown: function(callback) {
		process.on('SIGTERM', callback);
		process.on('SIGINT', callback);

		process.on('message', function(message) {
			if (message == 'shutdown') {
				callback();
			}
		});
	},

	resolvedPromise: function(retVal) {
		return new Promise((resolve) => {
			resolve(retVal);
		});
	}
}
