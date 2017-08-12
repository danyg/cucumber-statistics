'use strict';

var Servlet = require('../core/Servlet'),
	restResponses = require('../core/servletRestResponses'),
	results = require('../app/results'),

	bodyParser = require('body-parser'),

	express = require('express'),
	LOGGER = new (require('../core/Logger'))('resultsServlet')
;

class ResultsServlet extends Servlet {
	_createApp() {
		this._route = '/results';
		this._app = express();

		this._app.use(bodyParser.json());

		let accepted = Object.keys(results.implementations);

		let defaultDBDocumentHandler = (res, next, data) => {
			if(data instanceof Error) {
				restResponses.error500(res, data);
			} else {
				restResponses.ok200(res, data);
			}

			next();
		}

		let defaultRequestHandler = (methodName, req, res, next) => {
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
					if(methodName.indexOf('update') === 0) {
						args.push(req.body);
					}
					args.push(defaultDBDocumentHandler.bind(this._app, res, next));

					impl[methodName].apply(impl, args);

				} catch(e) {
					restResponses.error500(res, e);
					LOGGER.error(e, e.stack);
				}

			} else {
				restResponses.error404(res, type);
				next();
			}
		}

		var methods = Object.keys(results.iface.prototype);
		accepted.forEach(item => {
			methods = methods.concat(Object.keys(results.implementations[item].prototype));
		});
		var BASE_MATCHER = '/:nightlyId/:type/';

		methods.forEach(methodName => {
			if(methodName.indexOf('getBy') === 0) {
				this._app.get(
					BASE_MATCHER + methodName + '/:id',
					defaultRequestHandler.bind(
						this._app,
						methodName
					)
				);
			} else if(methodName.indexOf('update') === 0) {
				this._app.post(
					BASE_MATCHER + methodName + '/:id',
					defaultRequestHandler.bind(
						this._app,
						methodName
					)
				);
			} else {
				this._app.get(
					BASE_MATCHER + methodName,
					defaultRequestHandler.bind(
						this._app,
						methodName
					)
				);
			}
		});
	}
}

module.exports = ResultsServlet;
