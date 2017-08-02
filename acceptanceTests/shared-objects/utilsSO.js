const Logger = require('../../core/Logger');
const testId = require('../../public/app/bindings/testid');
global.LOGGER = new Logger('acceptanceTests');

// LOGGER.debug('DEBUG!!!')
// LOGGER.info('INFO!!!')
// LOGGER.warn('WARN!!!')
// LOGGER.error('Error!!!')

module.exports = {
	camelize: testId.convertToTestId,

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
