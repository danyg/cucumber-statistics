'use strict';

var MongoClient = require('mongodb').MongoClient,
	EventEmitter = require('events').EventEmitter
;

var e = new EventEmitter(),
	isConnected = false,
	isUsed = false,
	_DB_ = null
;

const MONGO_URL = 'mongodb://localhost:27017/';

function connect(dbName, cbk) {
	return new Promise(function(resolve, reject) {
		if(isUsed) {
			return resolve(_DB_);
		}
		let mongoDBUrl = MONGO_URL + dbName;
		isUsed = true;

		if(typeof cbk === 'function') {
			onConnected(cbk);
		}

		console.log(`Connection to MongoDB to ${mongoDBUrl}...`);
		MongoClient.connect(mongoDBUrl, function(err, db) {
			if(err) {
				console.error(`Error connecting to ${mongoDBUrl}\nError:\n\t${err}\n`);
				reject(err);
			} else {

				isConnected = true;
				_DB_ = db;

				resolve(_DB_);
				e.emit('mongo-connected', db);
			}
		});
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