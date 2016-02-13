'use strict'

var crypto = require('crypto');

module.exports = {

	md5: function(data) {
		return crypto.createHash('md5').update(data).digest("hex");
	},
	sha256: function(data) {
		return crypto.createHash('sha256').update(data).digest("hex");
	}
};