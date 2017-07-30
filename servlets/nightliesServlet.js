'use strict';

var Servlet = require('../core/Servlet'),
	fs = require('fs'),
	dbPath = process.cwd() + '/db',
	restResponses = require('../core/servletRestResponses'),
	mongoDB = require('../core/mongoDB'),
	nighltiesModel = require('../app/models/nighltiesModel')(),

	express = require('express'),
	app = express(),
	LOGGER = new (require('../core/Logger'))('nightliesServlet')
;

app.get('/', function(req, res) {
	if(mongoDB.isUsed()) {
		nighltiesModel.find().toArray(function(err, docs) {
			LOGGER.debug('find return', err, docs);
			if(!!err) {
				restResponses.error500(res, 'Error retrieving nightlyies form MongoDB ' + err);
			} else {
				if(docs.length > 0) {
					var listOfNightlies = docs.map(function(item) {
						return item._id;
					});
					LOGGER.debug('returning', listOfNightlies);

					restResponses.ok200(res, listOfNightlies);
				} else {
					restResponses.error404(res, 'not registed nightlies');
				}

			}
		});
	} else {
		if (fs.statSync(dbPath).isDirectory()) {
			var nightlies = fs.readdirSync(dbPath).filter(function(fileName) {
				return fs.statSync(dbPath + '/' + fileName).isDirectory();
			});

			if(nightlies.length > 0) {
				restResponses.ok200(res, nightlies);
			} else {
				restResponses.error404(res, 'not registed nightlies');
			}
		} else {
			restResponses.error500(res, 'database directory doesn\'t exists.');
		}
	}
});

module.exports = new Servlet('/nightlies', app);