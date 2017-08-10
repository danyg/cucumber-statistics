const Logger = require('../../core/Logger');
const testId = require('../../public/app/bindings/testid');
global.LOGGER = new Logger('acceptanceTests');

// LOGGER.debug('DEBUG!!!')
// LOGGER.info('INFO!!!')
// LOGGER.warn('WARN!!!')
// LOGGER.error('Error!!!')

module.exports = {
	camelize: testId.convertToTestId,

	onShutdown(callback) {
		process.on('SIGTERM', callback);
		process.on('SIGINT', callback);

		process.on('message', function(message) {
			if (message == 'shutdown') {
				callback();
			}
		});
	},

	resolvedPromise(retVal) {
		return new Promise((resolve) => {
			resolve(retVal);
		});
	},

	takeScreenshot() {
		// PROBLEM: scenario is defined at this point, from beforeScenario hook
		// but that instance of scenario doesn't have the method attach,
		// therefore no interactions with scenario before the afterScenario ¯\_(ツ)_/¯
		return this.resolvedPromise();

		driver.takeScreenshot().then(screenShot => {

			shared.scenarioStore.scenario
				.attach(
					new Buffer(screenShot, 'base64'),
					'image/png'
				)
			;

		});
	},

	waits(time) {
		return new Promise((resolve) => {
			setTimeout(_ => resolve(), time);
		});
	}
}
