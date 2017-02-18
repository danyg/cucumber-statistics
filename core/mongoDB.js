'use strict';

var MongoClient = require('mongodb').MongoClient,
	EventEmitter = require('events').EventEmitter
;

var e = new EventEmitter(),
	isConnected = false,
	isUsed = false,
	_DB_ = null
;

var mongoDBUrl = 'mongodb://localhost:27017/cucumberStatistics';

function connect(cbk) {
	isUsed = true;

	if(typeof cbk === 'function') {
		onConnected(cbk);
	}

	MongoClient.connect(mongoDBUrl, function(err, db) {

		if(err) {
			console.error('Error connecting to ' + mongoDBUrl + ' due: ' + err.toString() );
			process.exit(-1);
		} else {
			isConnected = true;
			_DB_ = db;
			e.emit('mongo-connected', db);

		}
	});
}

function onConnected(cbk) {
	if(!!isConnected) {
		try {

			cbk(_DB_);

		} catch( err ) {
			console.error(err);
		}
	} else {

		e.on('mongo-connected', cbk);

	}

}

onConnected.onConnected = onConnected;

module.exports = {
	isUsed: function() {
		return isUsed;
	},
	isConnected: function() {
		return isConnected;
	},
	getDB: function() {
		return _DB_;
	},
	connect: connect,
	onConnected: onConnected
};