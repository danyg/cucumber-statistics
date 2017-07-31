const {TEST_PORT} = require('../testServer');
const BASE_URL = `http://localhost:${TEST_PORT}`;
const rp = require('request-promise');
const fs = require('fs');
const zlib = require('zlib');

const M = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE'
};

class RESTHTTPSO {
	constructor() {
		this.METHODS = M;
		this.M = M;
	}

	_() {
		return new Promise((resolve) => {resolve()});
	}

	get(uri) {
		return this.call(
			BASE_URL + uri,
			M.GET
		);
	}

	putFileAsGzip(uri, filePath) {
		return this.gzipFile(filePath)
			.then(fstring => this.put(uri, fstring))
		;
	}

	putFile(uri, filePath) {
		return this.readFile(filePath)
			.then(fstring => this.put(uri, fstring))
		;
	}

	put(uri, str) {
		let url = BASE_URL + uri;
		return this.call(
			BASE_URL + uri,
			M.PUT,
			str,
			true
		);
	}

	call(url, method, body, json) {
		method = method.toUpperCase();
		let opt = {
			method: method,
			uri: url,

			resolveWithFullResponse: true, // should return headers
			simple: true // should return failed status code too
		}
		if(json) {
			opt.json = json;
		}
		if(body) {
			opt.body = body;
			if(json && typeof(body) === 'string') {
				opt.body = JSON.parse(body);
			}
		}

		LOGGER.info(`<-- ${method} [${url}]` + (body ? ` sending [${body.length}] bytes` : ''));
		return rp(opt)
			.catch(err => {
				LOGGER.info(`--x ${method} [${url}] error: [${err}]`);
				return err;
			})
			.then(r => {
				LOGGER.info(`--> ${method} [${url}] status:[${r.status}]`);
				return r;
			})
		;
	}

	readFile (filePath) {
		return new Promise((resolve, reject) => {
			fs.readFile(filePath, (err, data) => {
				if(err) {
					reject(err);
					return;
				}
				resolve(data.toString());
			});
		});
	}

	gzipFile (filePath) {
		return this.readFile(filePath)
			.then(fstring => this._gzipString(fstring))
		;
	}

	_gzipString (str) {
		return new Promise((resolve, reject) => {
			zlib.gzip(str, (err, data) => {
				if(err) {
					reject(err);
					return;
				}
				resolve(data.toString());
			});
		});
	}
}

RESTHTTPSO.METHODS = M;
RESTHTTPSO.M = M;

module.exports = new RESTHTTPSO();
