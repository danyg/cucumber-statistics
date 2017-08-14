//var startApp = require('../server');
const Promise = require('bluebird');
const fork = require('child_process').fork;
const LOGGER = new (require('../core/Logger'))('testServer');
const fs = require('fs');

const TEST_PORT = 7357;
const TEST_DB_NAME = 'cucumberStatisticAT';

function cleanArchive() {
	const archive = `${process.cwd()}/archive`;
	const lstat = Promise.promisify(fs.lstat);
	const readdir = Promise.promisify(fs.readdir);
	const unlink = Promise.promisify(fs.unlink);
	LOGGER.debug(`Cleaning ${archive}`);

	return lstat(archive)
		.then(stats => {
			if(stats.isDirectory()) {
				return readdir(archive)
					.then(files => Promise.all(
						files.map(file => unlink(`${archive}/${file}`))
					))
				;
			}
		})
		.catch(e => {
			LOGGER.error(`Error cleaning archive ${archive} ERROR:\n\t${e}`);
			throw e;
		})
	;
}

function startTestServer(mongo, database, port) {
	return cleanArchive()
		.then(_ => new Promise((resolve, reject) => {
			mongo = mongo === undefined ? true : mongo;
			database = database === undefined ? TEST_DB_NAME: database;
			port = port === undefined ? TEST_PORT : port;

			let args = [];
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
		}))
	;
}

startTestServer.cleanArchive = cleanArchive;
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
