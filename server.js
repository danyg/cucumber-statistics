'use strict';

var loadServlets = require('./core/loadServlets'),
	express = require('express'),
	logger = require('express-logger'),
	app = express(),
	PORT = 9088
;

var servelets = loadServlets(__dirname + '/servlets');

app.use(logger({path: process.cwd() + '/logs/access.log'}));

servelets.forEach(function(servelet) {
	app.use(servelet.getRoute(), servelet.getServlet());
});

app.listen(PORT, function() {

	var os = require('os'),
		ifaces = os.networkInterfaces()
	;

	console.log('cucumber statistics listening in port ' + PORT + ' access:');
	console.log('\t- http://localhost:' + PORT + '/');

	Object.keys(ifaces).forEach(function (ifname) {
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family || iface.internal !== false) {
				return;
			}

			console.log('\t- http://' + iface.address + ':' + PORT +  '/');
		});
	});
});
