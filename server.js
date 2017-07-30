'use strict';

const LOGGER = new ( require('./core/Logger') )('cucumberStatistics');
const loadServlets = require('./core/loadServlets');
const mongoDB = require('./core/mongoDB');
const express = require('express');
const logger = require('express-logger');
const app = express();
const DEFAULT_DB_NAME = 'cucumberStatistics';
const DEFAULT_PORT = 9088;

function startHttpServer(port) {
	port = !!port ? port : DEFAULT_PORT;
	return new Promise(function(resolve, reject) {

		LOGGER.info('Loading Servlets ...');

		var servelets = loadServlets(__dirname + '/servlets');

		app.use(logger({path: process.cwd() + '/logs/access.log'}));

		servelets.forEach(function(servelet) {
			app.use(servelet.getRoute(), servelet.getServlet());
		});

		LOGGER.info(`Starting HTTP Server in port ${port} ...`);

		try{
			app.listen(port, function() {

				var os = require('os'),
					ifaces = os.networkInterfaces()
				;

				console.log('cucumber statistics listening in port ' + port + ' access:');
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
function startApp(mongodb, port) {
	return new Promise(function(resolve, reject) {
		if(!!mongodb) {
			let dbName = typeof(mongodb) === 'string' ? mongodb : DEFAULT_DB_NAME;
			return mongoDB.connect(dbName)
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
	startApp(process.argv.join(' ').toLowerCase().indexOf('mongodb') !== -1);
} else {
	module.exports = startApp;
}
