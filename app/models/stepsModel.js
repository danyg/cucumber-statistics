'use strict';

console.log('CREATING DB: ', process.cwd() + '/db/specs.json');

var Datastore = require('nedb'),
	db = new Datastore({
		filename: process.cwd() + '/db/specs.json',
		autoload: true
	})
;

module.exports = db;
