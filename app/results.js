'use strict';

var Searchable = require('./modelsHandlers/Searchable'),
	util = require('util'),
	scenariosDataStoreFactory = require('./models/scenariosModel'),
	stepsDataStoreFactory = require('./models/stepsModel')
;

function ScenariosSearchable(nightlyId) {
	Searchable.apply(this);
	this.model = scenariosDataStoreFactory(nightlyId);
}
util.inherits(ScenariosSearchable, Searchable);

function StepsSearchable(nightlyId) {
	Searchable.apply(this);
	this.model = stepsDataStoreFactory(nightlyId);
}
util.inherits(StepsSearchable, Searchable);

module.exports = {
	iface: Searchable,
	implementations: {
		scenarios: ScenariosSearchable,
		steps: StepsSearchable
	}
};
