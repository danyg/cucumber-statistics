'use strict';

var fs = require('fs'),
	dbPath = process.cwd() + '/db',
	Datastore = require('nedb'),
	coreUtils = require('./core/utils'),
	Q = require('q'),
	nightliesModel = require('./app/models/nighltiesModel')(),
	ScenariosSearchable = require('./app/modelsHandlers/ScenariosSearchable'),
	SOME_EXIT_CONDITION = false
;

(function wait () {
	console.log('wait...')
	if (!SOME_EXIT_CONDITION) setTimeout(wait, 10000);
})();

if (fs.statSync(dbPath).isDirectory()) {
	var nightlies = fs.readdirSync(dbPath).filter(function(fileName) {
		return fs.statSync(dbPath + '/' + fileName).isDirectory();
	});

	if(nightlies.length > 0) {
		console.log('Processing nightlies');

		var promises = [];

		nightlies.forEach(function(name) {
			var dfd = Q.defer();

			var n = {
				_id: name,
				lastBuildId: 1,
				lastExecution: Date.now()
			};
			getLastBuildIdOfNightly(name)
				.then(function(lastBuildId){
					n.lastBuildId = lastBuildId;
					pushNightly(n)
						.finally(dfd.resolve)
					;
				})
			;

			promises.push(dfd.promise);
		});

		Q.all(promises)
			.finally(function() {
				process.exit();
			})
		;
	} else {
		console.log('No nightlies found')
	}
} else {
	console.log('No db Directory')
}

function getLastBuildIdOfNightly(name) {
	var dfd = Q.defer();
	var scenarios = new ScenariosSearchable(name);
	scenarios.model.find({}, function(err, docs) {
		if(err) {
			console.log('Error getting scenarios from', name, err);
			dfd.reject(0);
		} else {

			var lastBuild = docs.reduce(function(prev, current) {
				var lastBuildStep = current.results.reduce(function(bP, c){
					c = parseInt(c.buildId, 10);
					return bP > c ? bP : c;
				});
				return prev > lastBuildStep ? prev : lastBuildStep;
			});

			dfd.resolve(lastBuild);
		}
	});
	return dfd.promise;
}

function pushNightly(obj){
	var dfd = Q.defer();

	console.log('Pushing Nightly', obj.name, ' Last Build Id Was: ', obj.lastBuildId)

	nightliesModel.update(
		{
			_id: obj._id
		},
		{
			$set: {
				lastBuildId: obj.lastBuildId,
				lastExecution: obj.lastExecution
			}
		},
		{
			upsert: true
		},
		function() {
			dfd.resolve();
		}
	);

	return dfd.promise;
}
