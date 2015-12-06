'use strict';

var Servlet = require('../core/Servlet'),
	results = require('../app/results'),

	bodyParser = require('body-parser'),

	express = require('express'),
	app = express()
;

app.use(bodyParser.json());

var accepted = Object.keys(results.implementations);

function defaultCallback(res, next, data) {
	if(data instanceof Error) {
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

		results.implementations[type][methodName](
			defaultCallback.bind(app, res, next)
		);

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
	app.get('/:type/' + methodName, defaultHandler.bind(app, methodName));
});

module.exports = new Servlet('/results', app);