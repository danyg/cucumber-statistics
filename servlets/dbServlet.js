'use strict';

var Servlet = require('../core/Servlet'),
	restResponses = require('../core/servletRestResponses'),
	CucumberJSONParser = require('../app/CucumberJSONParser'),
	nightliesModel = require('../app/models/nighltiesModel')(),

	bodyParser = require('body-parser'),

	express = require('express'),
	app = express(),
	LOGGER = new (require('../core/Logger'))('dbServlet')
;

app.use(bodyParser.json({limit: '50mb'}));

app.put(
	[
		'/set/:buildName/:buildId',
		'/set/:buildName/:buildId/:sync'
	],
	function(req, res) {

		if(req.is('application/json')) {
			let sync = false;
			var parser = new CucumberJSONParser(req.params.buildName, req.params.buildId);
			if(req.params.hasOwnProperty('sync') && req.params.sync) {
				sync = true;
			}
			let promise = updateNightly(req.params.buildName, req.params.buildId)
				.then(_ => { LOGGER.debug('Parsing new Nightly ' + req.params.buildName); return _; })
				.then(_ => parser.parse(req.body))
				.catch(e => restResponses.error400(res, e.message))
			;

			if(sync) {
				promise.then(_ => {
					LOGGER.debug('Responding');
					restResponses.ok201(res)
				})
			} else {
				LOGGER.debug('Responding');
				restResponses.ok201(res);
			}
		} else {
			restResponses.error405('Content-type not allowed only application/json is accepted');
		}

	}
);

function updateNightly(name, buildId) {
	LOGGER.debug(`Upserting nighly ${name}...`);
	return nightliesModel.update(
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
			}
		)
		.then(_ => {
			LOGGER.debug(`New Nighly Inserted ${name}.`);
			return _;
		})
	;
}

module.exports = new Servlet('/db', app);
