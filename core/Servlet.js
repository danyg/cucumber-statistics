'use strict';

function Servlet(route, app) {
	this.route = route;
	this.app = app;
}

Servlet.prototype.getRoute = function() {
	return this.route;
};

Servlet.prototype.getServlet = function() {
	return this.app;
};

module.exports = Servlet;
