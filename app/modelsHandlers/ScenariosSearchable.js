'use strict';

var Searchable = require('./Searchable'),
	scenariosDataStoreFactory = require('../models/scenariosModel'),
	util = require('util')
;

function ScenariosSearchable(nightlyId) {
	Searchable.apply(this);
	this.model = scenariosDataStoreFactory(nightlyId);
}
util.inherits(ScenariosSearchable, Searchable);


ScenariosSearchable.prototype.getFailedByBuildId = function(buildId, cbk) {
	this.model.find({
		$or: [
			{
				'results.buildId': buildId.toString(),
				'results.status': 'failed'
			},
			{
				'results.buildId': buildId.toString(),
				clon: true
			}
		]
	}).toArray(function(err, docs) {
		if(err) {
			cbk(new Error(err));
		} else {
			Searchable.processDocs(docs);
			docs = docs.filter(function(item) {
				return item.clone ||
					item.lastStatus !== 'passed' // the query just return results
					// with failed, doesn't check the last result therefore this filter
				;
			});
			cbk(docs.sort(Searchable.sortByMoreFailed));
		}
	});
};

ScenariosSearchable.prototype.updateUserStatus = function(scenarioId, json, cbk) {
	this.model.update(
		{
			_id: scenarioId
		},
		{
			$set: {
				userStatus: json.userStatus
			}
		},
		{
			upsert: true
		},
		function(/*numReplaced, newDoc*/) {
			cbk({ok: true});
		}
	);
};

module.exports = ScenariosSearchable;