'use strict';

var Servlet = require('../core/Servlet'),
	nightliesModel = require('../app/models/nighltiesModel')(),
	ScenariosSearchable = require('../app/modelsHandlers/ScenariosSearchable'),
	restResponses = require('../core/servletRestResponses'),
	Q = require('q'),

	express = require('express'),
	app = express()
;

app.get('/', function(req, res, next) {

	getNightlies()
		.fail(function(err) {
			restResponses.error500('Error retriving nightlies', err);
		})
		.then(processNightlies)
		.then(function(data) {
			restResponses.ok200(res, data);
		})
	;

});

function getNightlies() {
	var dfd = Q.defer();
	nightliesModel.find().toArray(function(err, docs) {
		if(!!err) {
			dfd.reject(err);
		} else {

			dfd.resolve(docs);
		}
	});
	return dfd.promise;
}

function processNightlies(docs) {
	var dfd = Q.defer(),
		response = [],
		promises = []
	;

	docs.forEach(function(nightly) {
		var record = {
			name: nightly._id,
			build: nightly.lastBuildId,
			date: nightly.lastExecution
		};


		promises.push(getLastFailedSteps(record));

		response.push(record);
	});

	if(promises.length === 0) {
		dfd.resolve(response);
	} else {
		Q.all(promises).finally(function(){
			dfd.resolve(response);
		});
	}

	return dfd.promise;
};

function getLastFailedSteps(record) {
	var dfd = Q.defer();
	var nightlyScenarios = new ScenariosSearchable(record.name);

	nightlyScenarios.getFailedByBuildId(
		record.build,
		function(failedSteps){
			record.scenarios = failedSteps
			dfd.resolve();
		}
	);

	return dfd.promise;
}

module.exports = new Servlet('/lastExecution', app);