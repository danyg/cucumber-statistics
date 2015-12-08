'use strict';

var Searchable = require('./modelsHandlers/Searchable'),
	util = require('util'),
	scenariosDataStoreFactory = require('../models/scenariosModel'),
	stepsDataStoreFactory = require('../models/stepsModel')
;

function ScenariosSearchable(nightlyId) {
	this.model = scenariosDataStoreFactory(nightlyId);
}
util.inherits(ScenariosSearchable, Searchable);

function StepsSearchable(nightlyId) {
	this.model = stepsDataStoreFactory(nightlyId);
}
util.inherits(ScenariosSearchable, Searchable);

module.exports = {
	iface: Searchable,
	implementations: {
		scenarios: ScenariosSearchable,
		steps: StepsSearchable
	}
};
