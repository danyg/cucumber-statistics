'use strict';

var fs = require('fs'),
	dbPath = process.cwd() + '/db',
	Datastore = require('nedb'),
	coreUtils = require('./core/utils'),
	Q = require('q'),
	CucumberJSONParser = require('./app/CucumberJSONParser')
;

var nightlies = fs.readdirSync(dbPath).filter(function(fileName) {
	return fs.statSync(dbPath + '/' + fileName).isDirectory();
});

var nightliesPromises = [],
	SOME_EXIT_CONDITION = false
;

(function wait () {
	console.log('wait...')
	if (!SOME_EXIT_CONDITION) setTimeout(wait, 10000);
})();

nightlies.forEach(function(nIdPath) {

	var db = new Datastore({
		filename: process.cwd() + '/db/' + nIdPath + '/scenarios.json',
		autoload: true
	});

	var oldScenarios = [],
		promises = []
	;

	var pp = Q.promise(function (baseResolve, baseReject) {
		Q.promise(function (resolve, reject) {
			db.find({}, function (err, docs) {
				if(!err) {
					docs.forEach(function(scenario) {
						var scenarioId = scenario._id;

						if(scenarioId.substr(0,2) === 'dG') {
							return;
						}

						scenario.steps.forEach(function(step){
							if(!step.keyword) {
								return;
							}

							scenarioId += step.id+'-'+step.name+';';

						});

						scenarioId = coreUtils.sha256(scenarioId);
						oldScenarios.push(scenario._id);
						scenario._id = 'dG' + scenarioId;
						promises.push(pushNewScenario(db, nIdPath, scenario));
					});

				} else {
					console.error('Err with ' + nIdPath, err);
				}
				resolve();
			});
		}).then(function(){

			console.log('Removing Old Scenarios in', nIdPath);

			oldScenarios.forEach(function(id) {
				promises.push(removeOldScenario(db, nIdPath, id));
			});


			Q.all(promises)
				.finally(function() {
					console.log('Compacting', nIdPath);

					db.on('compaction.done', function () {
						db.removeAllListeners('compaction.done');
						baseResolve();
					});

					var r = db.persistence.compactDatafile();

				})
			;
		});
	});

	nightliesPromises.push(pp);

	console.log('promises', promises.length);

});

console.log('nightliesPromises', nightliesPromises.length);

Q.all(nightliesPromises).finally(function() {
	console.log('FINISH!');
	SOME_EXIT_CONDITION	= true;
	process.exit();
});


function pushNewScenario(db, nIdPath, scenario) {
	var dfd = Q.defer();
	db.insert(scenario, function(err) {
		if(err) {
			console.error('Err inserting ', nIdPath, scenario._id, scenario);
			dfd.reject();
		} else {
			console.log('Updated', scenario.name, 'in', nIdPath, 'nightly');
			dfd.resolve();
		}

	});
	// console.log(scenario._id, scenario.name);
	return dfd.promise;
}

function removeOldScenario(db, nIdPath, id){
	var dfd = Q.defer();
	db.remove({_id: id}, function(err, numRemoved) {
		if(!!err || numRemoved === 0) {
			console.error('Err removing ' + nIdPath, id);
			dfd.reject();
		} else {
			console.log('Removed', id, 'in', nIdPath, 'nightly');
			dfd.resolve();
		}
	});
	return dfd.promise;
}