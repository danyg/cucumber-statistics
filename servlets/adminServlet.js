'use strict';

var Servlet = require('../core/Servlet'),
	restResponses = require('../core/servletRestResponses'),

	express = require('express'),
	app = express(),
	LOGGER = new (require('../core/Logger'))('adminServlet')
;

app.all('/restart', function(req, res) {

	LOGGER.info('Restarting...');
	restResponses.ok200(res, {'message': 'Restarting'});

	process.exit();

});

module.exports = new Servlet('/admin', app);
