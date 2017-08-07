'use strict';

const LOGGER = new ( require('./core/Logger') )('cucumberStatistics');
const loadServlets = require('./core/loadServlets');
const mongoDB = require('./core/mongoDB');
const express = require('express');
const logger = require('express-logger');
const DEFAULT_DB_NAME = 'cucumberStatistics';
const DEFAULT_PORT = 9088;
const program = require('commander');
const http = require('http');

program
	.version('0.1.0')
	.option('-m, --mongodb', 'Uses mongo as database, nedb (files) is use by default instead')
	.option('-d, --database <databaseName>', 'name of the database')
	.option('-p, --port <port>', `Defines the port to be used by the web server, ${DEFAULT_PORT} is used instead`, p => parseInt(p, 10))
	.parse(process.argv)
;

process.on('unhandledRejection', r => LOGGER.error('unhandledRejection\n\t', r));

function startHttpServer(port) {
	port = !!port ? port : DEFAULT_PORT;
	return new Promise(function(resolve, reject) {
		const app = express();
		const server = http.createServer(app);

		app.use(logger({path: process.cwd() + '/logs/access.log'}));

		LOGGER.info('Loading Servlets ...');
		var servlets = loadServlets(__dirname + '/servlets');
		servlets.forEach(Servelet => {
			let servlet;
			try {
				servlet = new Servelet(app, server);
				try {
					servlet.serve();
				} catch(serveError) {
					LOGGER.error(`Error trying to serve ${Servelet.name}\n\tERROR: `, serveError);
				}
			} catch(instanceError) {
				LOGGER.error(`Error trying to construct ${Servelet.name}\n\tERROR: `, instanceError);
			}
		});

		LOGGER.info(`Starting HTTP Server in port ${port} ...`);

		try{
			server.listen(port, function() {

				var os = require('os'),
					ifaces = os.networkInterfaces()
				;

				console.log('\nCucumber Statistics listening in port ' + port + ' access:');
				resolve(app);
				console.log('\t- http://localhost:' + port + '/');

				Object.keys(ifaces).forEach(function (ifname) {
					ifaces[ifname].forEach(function (iface) {
						if ('IPv4' !== iface.family || iface.internal !== false) {
							return;
						}

						console.log('\t- http://' + iface.address + ':' + port +  '/');
					});
				});

			});
		} catch(e) {
			LOGGER.error(`Error trying to start server in port ${port}\nError:\n\t${e}\n`);
			reject(e);
		}
	});
}

function catchError(reject, e) {
	if (require.main === module) {
		LOGGER.error('\nError starting the app\nError:\n\t', e);
		process.exit(-1);
	}
	reject(e);
}

/**
 * Initialize the application
 *
 * @param  {Boolean|String}   mongodb if true will use mongo as database, if string will use the string as database name
 * @param  {int} port         port where the web server will be listening
 */
function startApp(mongo, databaseName, port) {
	console.log('Starting Cucumber Statistics with:',
		(mongo ? '\n\t- \u001b[1;33mMongoDB\u001b[0m as DBRMS':'NeDB as DBRMS'),
		'\n\t- Database: "' + (databaseName ? databaseName: DEFAULT_DB_NAME) + '"',
		'\n\t- Port: ' + (port ? port : DEFAULT_PORT)
	);
	return new Promise(function(resolve, reject) {
		if(!!mongo) {
			databaseName = typeof(databaseName) === 'string' ? databaseName : DEFAULT_DB_NAME;
			return mongoDB.connect(databaseName)
				.catch(catchError.bind(null, reject))
				.then(_ => startHttpServer(port))
				.then(_ => {
					process.send ? process.send('STARTED') : '';
					return _;
				})
				.then(resolve)
			;
		} else {
			return startHttpServer(port)
				.then(_ => {
					process.send ? process.send('STARTED') : '';
					return _;
				})
				.then(resolve)
				.catch(catchError.bind(null, reject))
			;
		}
	});

};

if (require.main === module) {
	startApp(program.mongodb, program.database, program.port);
} else {
	module.exports = startApp;
}
