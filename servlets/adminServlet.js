'use strict';

var Servlet = require('../core/Servlet'),
	restResponses = require('../core/servletRestResponses'),

	express = require('express'),
	app = express()
;

app.all('/restart', function(req, res) {

	console.log('Restarting...');
	restResponses.ok200(res, {'message': 'Restarting'});

	process.exit();

});

module.exports = new Servlet('/admin', app);
