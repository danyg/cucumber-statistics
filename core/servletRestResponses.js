'use strict';

module.exports = {
	ok200: function(res, data) {
		if(!data) {
			return this.ok204(res);
		}
		res
			.status(200)
			.json(data)
		;
	},
	ok201: function(res) {
		res
			.status(201)
			.end()
		;
	},
	ok204: function(res) {
		res
			.status(204)
			.end()
		;
	},
	error404: function(res, data) {
		if(!data) {
			data = 'Not Found';
		}
		res.status(404).json({
			error: [
				{
					code: 'not.found',
					description: data
				}
			]
		});
	},
	error400: function(res, data) {
		var json = {
			error: [
				{
					code: 'content.error',
					description: 'Content received malformed'
				}
			]
		};
		if(!!data) {
			json.error.push({
				code: 'content.error.description',
				description: data
			});
		}
		res.status(400).json(json);
	},
	error405: function(res, data) {
		if (!data) {
			data = 'Method not allowed';
		}
		res.status(405).json({
			error: [
				{
					code: 'method.not.allowed',
					description: data
				}
			]
		});
	},
	error500: function(res, data) {
		if(!data) {
			data = {message: 'unknown'};
		}

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
};