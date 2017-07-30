var startApp = require('../server');
const fork = require('child_process').fork;

const TEST_PORT = 7357;
const TEST_DB_NAME = 'cucumberStatisticAT';

function startTestServer() {
	return startApp(TEST_DB_NAME, TEST_PORT);
}
startTestServer.startTestServer = startTestServer;
startTestServer.TEST_PORT = TEST_PORT;
startTestServer.TEST_DB_NAME = TEST_DB_NAME;

module.exports = startTestServer;
// module.exports = function() {
// 	return new Promise((ok,fail) => {
// 		let process = fork('../server')
// 		process.on('message', (data) => {
// 			if(data === 'STARTED') {
// 				ok(process);
// 			}
// 		});
// 		process.on('close', (data) => {
// 			reject();
// 		});
// 	});
// };

if (require.main === module) {
	startTestServer();
}
