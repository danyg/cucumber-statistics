'use strict';

var Servlet = require('../core/Servlet'),
	fs = require('fs'),
	dbPath = process.cwd() + '/db',
	restResponses = require('../core/servletRestResponses'),

	express = require('express'),
	app = express()
;

app.get('/', function(req, res) {

	if (fs.statSync(dbPath).isDirectory()) {
		var nightlies = fs.readdirSync(dbPath).filter(function(fileName) {
			return fs.statSync(dbPath + '/' + fileName).isDirectory();
		});

		if(nightlies.length > 0) {
			restResponses.ok200(res, nightlies);
		} else {
			restResponses.error404(res, 'not registed nightlies');
		}
	} else {
		restResponses.error404(res, 'database directory doesn\'t exists.');
	}
});

module.exports = new Servlet('/nightlies', app);