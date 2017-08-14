'use strict';

// const Promise = require('bluebird');

var Servlet = require('../core/Servlet'),
	restResponses = require('../core/servletRestResponses'),
	CucumberJSONParser = require('../app/CucumberJSONParser'),
	nightliesModel = require('../app/models/nighltiesModel')(),

	bodyParser = require('body-parser'),

	express = require('express'),
	LOGGER = new (require('../core/Logger'))('dbServlet')
;

class DBServlet extends Servlet {
	_createApp() {
		this._route = '/db';
		this._app = express();

		this._app.use(bodyParser.json({limit: '50mb'}));
		this._app.put(
			[
				'/set/:buildName/:buildId',
				'/set/:buildName/:buildId/:sync'
			],
			this.set.bind(this)
		);
	}

	set(req, res) {
		if(req.is('application/json')) {
			let sync = false;
			var parser = new CucumberJSONParser(req.params.buildName, req.params.buildId);
			if(req.params.hasOwnProperty('sync') && req.params.sync) {
				sync = true;
			}
			let promise = this.updateNightly(req.params.buildName, req.params.buildId)
				.then(_ => { LOGGER.debug('Parsing new Nightly ' + req.params.buildName); return _; })
				.then(_ => parser.parse(req.body))
				.catch(e => {
					let err = !e ? 'unknown' : e;
					LOGGER.error(`Error parsing JSON ERROR:\n\t${err}`);
					restResponses.error400(res, err.hasOwnProperty('message') ? err.message : err);
				} )
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

	updateNightly(name, buildId) {
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

}

module.exports = DBServlet;
