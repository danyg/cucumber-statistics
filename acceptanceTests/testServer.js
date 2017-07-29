var startApp = require('../server');

const TEST_PORT = 7357;
const TEST_DB_NAME = 'cucumberStatisticAT';

function startTestServer() {
	return startApp(TEST_DB_NAME, TEST_PORT);
}
startTestServer.startTestServer = startTestServer;
startTestServer.TEST_PORT = TEST_PORT;
startTestServer.TEST_DB_NAME = TEST_DB_NAME;

module.exports = startTestServer;

if (require.main === module) {
	startTestServer();
}
