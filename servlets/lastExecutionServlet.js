'use strict';

var Servlet = require('../core/Servlet'),
	nightliesModel = require('../app/models/nighltiesModel')(),
	ScenariosSearchable = require('../app/modelsHandlers/ScenariosSearchable'),
	restResponses = require('../core/servletRestResponses'),

	express = require('express')
;

class LastExecutionsServlet extends Servlet {
	_createApp() {
		this._route = '/lastExecution';
		this._app = express();

		this._app.get('/', (req, res, next) => {

			this.getNightlies()
				.catch(err => restResponses.error500('Error retriving nightlies', err))
				.then(this.processNightlies.bind(this))
				.then(data => restResponses.ok200(res, data))
			;

		});
	}

	getNightlies() {
		return nightliesModel.find().toArray();
	}

	processNightlies(docs) {
		return new Promise((resolve, reject) => {
			let promises = [];
			let response = [];
			docs.forEach(nightly => {
				var record = {
					name: nightly._id,
					build: nightly.lastBuildId,
					date: nightly.lastExecution
				};

				promises.push(this.getLastFailedSteps(record));

				response.push(record);
			});

			if(promises.length === 0) {
				resolve(response);
			} else {
				Promise.all(promises)
					.catch(_ => resolve(response))
					.then(_ => resolve(response))
				;
			}
		});
	}

	getLastFailedSteps(record) {
		return new Promise((resolve, reject) => {
			var nightlyScenarios = new ScenariosSearchable(record.name);

			nightlyScenarios.getFailedByBuildId(
				record.build,
				failedSteps => {
					record.scenarios = failedSteps
					resolve();
				}
			);
		});
	}
}

module.exports = LastExecutionsServlet;