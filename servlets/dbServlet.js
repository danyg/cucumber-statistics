'use strict';

var Servlet = require('../core/Servlet'),
	restResponses = require('../core/servletRestResponses'),
	CucumberJSONParser = require('../app/CucumberJSONParser'),
	nightliesModel = require('../app/models/nighltiesModel')(),

	bodyParser = require('body-parser'),

	express = require('express'),
	app = express()
;

app.use(bodyParser.json({limit: '50mb'}));

app.put('/set/:buildName/:buildId', function(req, res) {

	if(req.is('application/json')) {
		var parser = new CucumberJSONParser(req.params.buildName, req.params.buildId);
		updateNightly(req.params.buildName, req.params.buildId);

		try {
			console.log('Parsing new Nightly ' + req.params.buildName);
			parser.parse(req.body);
			restResponses.ok201(res);
		} catch( e ) {
			restResponses.error400(res, e.message);
		}
	} else {
		restResponses.error405('Content-type not allowed only application/json is accepted');
	}

});

function updateNightly(name, buildId) {
	nightliesModel.update(
		{
			_id: name
		},
		{
			$set: {
				lastBuildId: buildId,
				lastExecution: Date.now()
			}
		},
		{
			upsert: true
		},
		function(/*numReplaced, newDoc*/) {
			console.log('new Nighly Inserted', name);
		}
	);
}

module.exports = new Servlet('/db', app);