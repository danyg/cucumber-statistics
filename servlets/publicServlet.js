'use strict';

var Servlet = require('../core/Servlet'),
	path = require('path'),
	gzipStatic = require('connect-gzip-static'),
	express = require('express');
;

class PublicServlet extends Servlet {
	_createApp() {
		this._route = '/';
		this._app = express();

		this._app.use('/', gzipStatic(
			path.resolve(__dirname + '/../public'),
			{
				gzCached: false
			}
		));
		this._app.use('/vendor', gzipStatic(
			path.resolve(__dirname + '/../node_modules'),
			{
				gzCached: false
			}
		));
	}
}

module.exports = PublicServlet;
