'use strict';

var Servlet = require('../core/Servlet'),
	express = require('express'),
	path = require('path')
;

module.exports = new Servlet('/', express.static(path.resolve(__dirname + '/../public') ) );