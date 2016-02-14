'use strict';

var fork = require('child_process').fork,
	server
;

function start() {
	server = fork('./server');

	server.on('close', function() {
		stop();
		console.log('Server disconnected restarting');
		start();
	});

	server.on('disconnect', function() {
		stop();
		console.log('Server disconnected restarting');
		start();
	});

	server.on('error', function(err) {
		console.error(err);
	});
};

function stop() {
	server.removeAllListeners();
	server.kill();
}

start();
