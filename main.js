'use strict';

var loadServlets = require('./core/loadServlets'),
	express = require('express'),
	app = express(),
	PORT = 9088
;

var servelets = loadServlets(__dirname + '/servlets');

servelets.forEach(function(servelet) {
	app.use(servelet.getRoute(), servelet.getServlet());
});

app.listen(PORT, function() {
	console.log('cucumber statistics listening in port ' + PORT + ' access: http://localhost:' + PORT + '/');
});

