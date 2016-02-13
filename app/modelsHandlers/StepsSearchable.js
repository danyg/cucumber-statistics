'use strict';

var Searchable = require('./Searchable'),
	stepsDataStoreFactory = require('../models/stepsModel'),
	util = require('util')
;

function StepsSearchable(nightlyId) {
	Searchable.apply(this);
	this.model = stepsDataStoreFactory(nightlyId);
}
util.inherits(StepsSearchable, Searchable);


module.exports = StepsSearchable;