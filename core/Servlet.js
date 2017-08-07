'use strict';

class Servlet {
	constructor(rootApp, server) {
		this._route = 'TO_BE_DEFINED';
		this._rootApp = rootApp;
		this._server = server;
		this._createApp();
	}

	_createApp() {
		throw new Error(this.constructor.name + '._createApp IMPLEMENT IT!');
	}

	getRoute() {
		return this._route;
	}

	getServlet() {
		return this._app;
	}

	serve() {
		this._rootApp.use(
			this._route,
			this._app
		);
	}
}

module.exports = Servlet;
