'use strict';

var fork = require('child_process').fork,
	server
;

function start() {

	var forkArgs = process.argv.slice(0);
	forkArgs.splice(0,2);

	server = fork('./server', forkArgs);

	server.on('close', function(code, signal) {
		stop();
		console.log(`Server disconnected [CODE: ${code}, SIGNAL: ${signal}] restarting\n`);
		start();
	});

	server.on('disconnect', function(e) {
		stop();
		console.log('Server disconnected restarting...\n');
		start();
	});

	server.on('message', function(msg) {
		if(msg.toString() === 'SHUTDOWN') {
			console.log('Shutdown received, stoping server and watchdog...\n');
			stop();
			process.exit(0);
		}
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
