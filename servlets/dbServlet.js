'use strict';

var Servlet = require('../core/Servlet'),
	CucumberJSONParser = require('../app/CucumberJSONParser'),

	bodyParser = require('body-parser'),

	express = require('express'),
	app = express(),
	path = require('path')
;

function send405(res){
	res.status(405).json({
		error: [
			{
				code: 'type.allowed',
				description: 'Content-type not allowed'
			}
		]
	});
}
function send400(res, error){
	res.status(400).json({
		error: [
			{
				code: 'content.error',
				description: 'Content received malformed'
			},
			{
				code: 'content.error.description',
				description: error.message
			}
		]
	});
}
function send201(res){
	res.status(201).end();
}

app.use(bodyParser.json({limit: '50mb'}));

app.put('/set/:buildName/:buildId', function(req, res, next) {

	if(req.is('application/json')) {
		var parser = new CucumberJSONParser(req.params.buildName, req.params.buildId);
		try {
			parser.parse(req.body);
			send201(res);
		} catch( e ) {
			send400(res, e);
		}
	} else {
		send405(res);
	}

});

module.exports = new Servlet('/db', app);