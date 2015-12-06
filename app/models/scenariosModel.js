'use strict';

console.log('CREATING DB: ', process.cwd() + '/db/scenarios.json');

var Datastore = require('nedb'),
	db = new Datastore({
		filename: process.cwd() + '/db/scenarios.json',
		autoload: true
	})
;

module.exports = db;
