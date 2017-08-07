'use strict';

var Servlet = require('../core/Servlet'),
	path = require('path'),
	gzipStatic = require('connect-gzip-static');
;

class PublicServlet extends Servlet {
	_createApp() {
		this._route = '/';
		this._app = gzipStatic(
			path.resolve(__dirname + '/../public'),
			{
				gzCached: false
			}
		);
	}
}

module.exports = PublicServlet;
