//var startApp = require('../server');
const fork = require('child_process').fork;

const TEST_PORT = 7357;
const TEST_DB_NAME = 'cucumberStatisticAT';

function startTestServer(mongo, database, port) {
	mongo = mongo === undefined ? true : mongo;
	database = database === undefined ? TEST_DB_NAME: database;
	port = port === undefined ? TEST_PORT : port;

	return new Promise((resolve, reject) => {
		var args = [];
		if(mongo) { args.push('-m'); }
		if(database) { args.push('--database', database); }
		if(port) { args.push('--port', port); }

		let process = fork('../server', args)
		process.on('message', (data) => {
			if(data === 'STARTED') {
				resolve(process);
			}
		});
		process.on('exit', (data) => {
			reject();
		});
	});
}

startTestServer.closeTestServer = function(process) {
	return new Promise((resolve, reject) => {
		process.on('close', _ => resolve());
		process.on('exit', _ => resolve());

		process.kill();
	});
};

startTestServer.startTestServer = startTestServer;
startTestServer.TEST_PORT = TEST_PORT;
startTestServer.TEST_DB_NAME = TEST_DB_NAME;
module.exports = startTestServer;
if (require.main === module) {
	startTestServer();
}
