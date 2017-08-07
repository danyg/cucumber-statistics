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
				let filePath = path.resolve(dirPath + '/' + servletFileName);
				let ServeletCtor = require(filePath);
				if(Servlet.isPrototypeOf(ServeletCtor) ) {
					toReturn.push(ServeletCtor);
				} else {
					LOGGER.error(`${filePath} must return an Servlet`)
				}
			}
		});

		return toReturn;
	} else {
		throw new Error('Servlet Path: "' + dirPath + '" doesn\'t exists.');
	}
};
