'use strict';

var Servlet = require('../core/Servlet'),
	results = require('../app/results'),

	bodyParser = require('body-parser'),

	express = require('express'),
	app = express()
;

app.use(bodyParser.json());

var accepted = Object.keys(results.implementations);

function return500(res, data){
	res
		.status(500)
		.json({
			error: [
				{
					code: 'internal.exception',
					description: data.message
				}
			]
		})
	;
}

function defaultCallback(res, next, data) {
	if(data instanceof Error) {
		return500(res, data);
	} else {

		res
			.status(200)
			.json(data)
		;
	}

	next();
}

function defaultHandler (methodName, req, res, next) {
	var type = req.params.type;

	if(accepted.indexOf(type) !== -1) {
		var args = [];
		if(!!req.params.id) {
			args.push(req.params.id);
		}
		args.push(defaultCallback.bind(app, res, next));

		try {

			results.implementations[type][methodName].apply(
				results.implementations[type],
				args
			);

		} catch(e) {
			return500(res, e);
		}

	} else {
		res.status(404).json({
			error: [
				{
					code: 'unrecognized.type',
					description: type
				}
			]
		});
		next();
	}
}

var methods = Object.keys(results.Searchable.prototype);

methods.forEach(function(methodName) {
	if(methodName.indexOf('getBy') !== -1) {
		app.get('/:type/' + methodName + '/:id', defaultHandler.bind(app, methodName));
	} else {
		app.get('/:type/' + methodName, defaultHandler.bind(app, methodName));
	}
});

module.exports = new Servlet('/results', app);