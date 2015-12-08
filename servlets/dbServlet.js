'use strict';

var Servlet = require('../core/Servlet'),
	restResponses = require('../core/servletRestResponses'),
	CucumberJSONParser = require('../app/CucumberJSONParser'),

	bodyParser = require('body-parser'),

	express = require('express'),
	app = express()
;

app.use(bodyParser.json({limit: '50mb'}));

app.put('/set/:buildName/:buildId', function(req, res) {

	if(req.is('application/json')) {
		var parser = new CucumberJSONParser(req.params.buildName, req.params.buildId);
		try {
			parser.parse(req.body);
			restResponses.ok201(res);
		} catch( e ) {
			restResponses.error400(res, e.message);
		}
	} else {
		restResponses.error405('Content-type not allowed only application/json is accepted');
	}

});

module.exports = new Servlet('/db', app);