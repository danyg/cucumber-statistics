'use strict';

var Datastore = require('nedb'),
	db = new Datastore({
		filename: process.cwd() + '/db/nighlties.json',
		autoload: true
	})
;

module.exports = function createDB(){
	return db;
};
