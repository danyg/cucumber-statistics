'use strict';

let Servlet = require('../core/Servlet'),
	fs = require('fs'),
	dbPath = process.cwd() + '/db',
	restResponses = require('../core/servletRestResponses'),
	mongoDB = require('../core/mongoDB'),
	nighltiesModel = require('../app/models/nighltiesModel')(),

	express = require('express'),
	app = express(),
	LOGGER = new (require('../core/Logger'))('nightliesServlet')
;

class NightliesServlet extends Servlet {
	constructor(...args) {
		super(...args);


	}

	_createApp() {
		this._route = '/nightlies';
		this._app = express();
		this._app.get('/', this.get.bind(this));
	}

	get(req, res) {
		if(mongoDB.isUsed()) {
			this.get = this.withMongo;
		} else {
			this.get = this.withNeDB;
		}
		return this.get(req, res);
	}

	withMongo(req, res) {
		nighltiesModel.find().toArray()
			.then(docs => {
				if(docs.length > 0) {
					let listOfNightlies = docs/*.map(function(item) {
						return item._id;
					});*/
					LOGGER.debug('returning', listOfNightlies);

					restResponses.ok200(res, listOfNightlies);
				} else {
					restResponses.error404(res, 'not registed nightlies');
				}
			})
			.catch(err => restResponses.error500(res, 'Error retrieving nightlyies form MongoDB ' + err))
		;
	}

	withNeDB(req, res) {
		if (fs.statSync(dbPath).isDirectory()) {
			let nightlies = fs.readdirSync(dbPath).filter(function(fileName) {
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
}



module.exports = NightliesServlet;