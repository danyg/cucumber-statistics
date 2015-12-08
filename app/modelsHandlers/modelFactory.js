'use strict';

var assert = require('assert'),
	sanitizeFilename = require('sanitize-filename'),
	Datastore = require('nedb'),
	modelsByNightlyId = {}
;

function sanitize(path) {
	path = sanitizeFilename(path, {replacement: '-'});
	return path
		.replace(/--/g, '-')
		.replace(/-$/g, '')
	;
}

module.exports = function createDataStore(modelFileName, nightlyId) {
	assert(nightlyId, 'Trying to create a model for an undefined nightlyId');
	assert(modelFileName, 'Trying to create a model for an undefined modelFileName');

	if( !modelsByNightlyId.hasOwnProperty(nightlyId) ) {
		modelsByNightlyId[modelFileName] = {};
	}

	if( !modelsByNightlyId.hasOwnProperty(nightlyId) ) {
		var nIdPath = sanitize(nightlyId);
		modelsByNightlyId[modelFileName][nightlyId] = new Datastore({
			filename: process.cwd() + '/db/' + nIdPath + '/' + modelFileName + '.json',
			autoload: true
		});
	}

	return modelsByNightlyId[modelFileName][nightlyId];
};
