'use strict';

var Servlet = require('../core/Servlet'),
	express = require('express'),
	path = require('path'),
	gzipStatic = require('connect-gzip-static');
;

module.exports = new Servlet('/', gzipStatic(path.resolve(__dirname + '/../public'), {gzCached: false} ) );