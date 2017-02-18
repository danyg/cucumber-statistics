'use strict';

var fork = require('child_process').fork,
	server
;

function start() {

	var forkArgs = process.argv.slice(0);
	forkArgs.splice(0,2);

	console.log('initiating server with args', forkArgs.join(' '));

	server = fork('./server', forkArgs);

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
}

function stop() {
	server.removeAllListeners();
	server.kill();
}

start();
