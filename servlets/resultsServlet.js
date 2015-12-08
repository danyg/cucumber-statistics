'use strict';

var Servlet = require('../core/Servlet'),
	restResponses = require('../core/servletRestResponses'),
	results = require('../app/results'),

	bodyParser = require('body-parser'),

	express = require('express'),
	app = express()
;

app.use(bodyParser.json());

var accepted = Object.keys(results.implementations);

function defaultDBDocumentHandler(res, next, data) {
	if(data instanceof Error) {
		restResponses.error500(res, data);
	} else {
		restResponses.ok200(res, data);
	}

	next();
}

function defaultRequestHandler (methodName, req, res, next) {
	var type = req.params.type;
	var nightlyId = req.params.nightlyId;


	if(accepted.indexOf(type) !== -1) {
		try {
			var Ctor = results.implementations[type],
				impl = new Ctor(nightlyId),
				args = []
			;

			if(!!req.params.id) {
				args.push(req.params.id);
			}
			args.push(defaultDBDocumentHandler.bind(app, res, next));

			impl[methodName].apply(impl, args);

		} catch(e) {
			restResponses.error500(res, e);
			console.error(e, e.stack);
		}

	} else {
		restResponses.error404(res, type);
		next();
	}
}

var methods = Object.keys(results.iface.prototype);
var BASE_MATCHER = '/:nightlyId/:type/';

methods.forEach(function(methodName) {
	if(methodName.indexOf('getBy') !== -1) {
		app.get(BASE_MATCHER + methodName + '/:id', defaultRequestHandler.bind(app, methodName));
	} else {
		app.get(BASE_MATCHER + methodName, defaultRequestHandler.bind(app, methodName));
	}
});

module.exports = new Servlet('/results', app);