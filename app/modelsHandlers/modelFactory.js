'use strict';

var assert = require('assert'),
	sanitizeFilename = require('sanitize-filename'),
	Datastore = require('nedb'),
	modelsByNightlyId = {},
	mongoDB = require('../../core/mongoDB')
;

function sanitize(path) {
	path = sanitizeFilename(path, {replacement: '-'});
	return path
		.replace(/--/g, '-')
		.replace(/-$/g, '')
	;
}

function getDBObject(nIdPath, modelFileName) {

	if(mongoDB.isUsed()) {
		if( mongoDB.isConnected() ) {
			return standarizeFindMethod( mongoDB.getDB().collection(modelFileName + '_' + nIdPath) );
			// return mongoDB.getDB().collection(modelFileName + '_' + nIdPath);
		} else {
			console.error('MongoDB Mode On, should be connected!!');
		}
	} else {
		return new Datastore({
			filename: process.cwd() + '/db/' + nIdPath + '/' + modelFileName + '.json',
			autoload: true
		});
	}

}

function standarizeFindMethod(mongoCollectionObj) {
	return mongoCollectionObj;
/*
	var originalFind = mongoCollectionObj.find;

	function find() {
		var args = Array.prototype.slice.call(arguments, 0);
		var cbk = args.splice(args.length-1, 1)[0];
		return originalFind.apply(this, args).toArray(cbk);
	}

	for(var m in originalFind) {
		if(originalFind.hasOwnProperty(m)) {
			find[m] = originalFind[m];
		}
	}

	mongoCollectionObj.find = find;
	return mongoCollectionObj;
*/
}

function createDataStore(modelFileName, nightlyId) {
	assert(nightlyId, 'Trying to create a model for an undefined nightlyId');
	assert(modelFileName, 'Trying to create a model for an undefined modelFileName');

	if( !modelsByNightlyId.hasOwnProperty(modelFileName) ) {
		modelsByNightlyId[modelFileName] = {};
	}

	if( !modelsByNightlyId[modelFileName].hasOwnProperty(nightlyId) ) {
		var nIdPath = sanitize(nightlyId);
		modelsByNightlyId[modelFileName][nightlyId] = getDBObject(nIdPath, modelFileName);
	}

	return modelsByNightlyId[modelFileName][nightlyId];
}

createDataStore.standarizeFindMethod = standarizeFindMethod;

module.exports = createDataStore;