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
		'results.buildId': buildId.toString(),
		'results.status': 'failed',
	},function(err, docs) {
		if(err) {
			cbk(new Error(err));
		} else {
			Searchable.processDocs(docs);
			cbk(docs.sort(Searchable.sortByMoreFailed));
		}
	});
};


module.exports = ScenariosSearchable;