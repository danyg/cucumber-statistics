'use strict';

var Servlet = require('../core/Servlet'),
	restResponses = require('../core/servletRestResponses'),

	express = require('express'),

	LOGGER = new (require('../core/Logger'))('adminServlet')
;

class AdminServlet extends Servlet {
	_createApp() {
		this._route = '/admin';
		this._app = express();

		this._app.all('/restart', this.restart.bind(this));
		this._app.all('/shutdown', this.shutdown.bind(this));
	}

	restart(req, res) {
		LOGGER.info('Restarting...');
		restResponses.ok200(res, {'message': 'Restarting'});

		process.exit(0);
	}

	shutdown(req, res) {
		restResponses.ok200(res, {'message': 'Shuting down'});

		if(process.send) {
			try {
				process.send('SHUTDOWN');
				process.exit(0);
			} catch(e) {
			}
		} else {
			process.exit(0);
		}
	}
}

module.exports = AdminServlet;
