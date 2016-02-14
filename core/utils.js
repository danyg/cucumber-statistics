'use strict'

var crypto = require('crypto'),
	path = require('path'),
	fs = require('fs'),
	mkpath = require('mkpath')
;

module.exports = {

	md5: function(data) {
		return crypto.createHash('md5').update(data).digest("hex");
	},
	sha256: function(data) {
		return crypto.createHash('sha256').update(data).digest("hex");
	},
	mkdir: function(fileName) {
		var dirname = path.dirname(fileName);
		return mkpath.sync(dirname);
	}
};