'use strict';

var fs = require('fs'),
	path = require('path'),
	Servlet = require('./Servlet')
;

module.exports = function loadServlets(dirPath){
	var toReturn = [];
	if (fs.statSync(dirPath).isDirectory()) {

		var servletsFiles = fs.readdirSync(dirPath);

		servletsFiles.forEach(function(servletFileName) {
			if(servletFileName.indexOf('Servlet.js')) {
				var filePath = path.resolve(dirPath + '/' + servletFileName);
				var servelet = require(filePath);
				if(servelet instanceof Servlet) {
					toReturn.push(servelet);
				}
			}
		});

		return toReturn;
	} else {
		throw new Error('Servlet Path: "' + dirPath + '" doesn\'t exists.');
	}
};
