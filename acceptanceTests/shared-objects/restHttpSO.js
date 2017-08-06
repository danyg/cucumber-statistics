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

const mathDates={
	calculateDateDiff:function(e,t,a){e=e instanceof Date?e.getTime():e,t=t instanceof Date?t.getTime():t;var n=1,s=0;return e>t?(s=e-t,n=-1):s=t>e?t-e:0,this.msToHuman(s,n,a)},
	msToHuman:function(e,t,a){t=void 0===t?0>e?-1:1:t;var n=new Date;n.setTime(Math.abs(e));var s=["Y","M","D","h","m","s"];a&&s.push("ms");var i=[n.getUTCFullYear()-1970,n.getUTCMonth(),n.getUTCDate()-1,n.getUTCHours(),n.getUTCMinutes(),n.getUTCSeconds(),n.getUTCMilliseconds()];return s.map(function(e,t){return i[t]>0?i[t]+e:""}).join(" ").trim()+(0>t?" ago":"")}
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
		let startTime = Date.now();
		return rp(opt)
			.catch(err => {
				let endTime = Date.now();
				LOGGER.info(`--x ${method} [${url}] error: [${err}] in [${mathDates.calculateDateDiff(startTime, endTime, true)}]`);
				return err;
			})
			.then(r => {
				let endTime = Date.now();
				LOGGER.info(`--> ${method} [${url}] status:[${r.statusCode}] in [${mathDates.calculateDateDiff(startTime, endTime, true)}]`);
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
