'use strict';

var mongoDB = require('../../core/mongoDB'),
	// modelFactory = require('../modelsHandlers/modelFactory'),
	db
;


if(mongoDB.isUsed()) {
	if( mongoDB.isConnected() ) {
		var collection = mongoDB.getDB().collection('nightlies');
		// db = modelFactory.standarizeFindMethod(collection);
		db = collection;
	} else {
		console.error('MongoDB Mode On, should be connected!!');
	}
} else {
	var Datastore = require('nedb');

	db = new Datastore({
		filename: process.cwd() + '/db/nightlies.json',
		autoload: true
	});
}

module.exports = function createDB(){
	return db;
};
