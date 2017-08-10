const {spawn} = require('child_process');
const {EventEmitter} = require('events');

const RESOLVED = 'resolved';
const REJECTED = 'rejected';
const PENDING = 'pending';

function getErr(args, err) {
	let cmd = args[0];
	if(args[1]) {
		cmd += ' ' + args[1].join(' ');
	}
	return {
		cmd: cmd,
		err: err
	};
}

module.exports.mySpawn = function mySpawn(...args) {
	let ev = new EventEmitter();
	let vResolve, vReject;
	let promise = new Promise((a, b) => {
		vResolve = a;
		vReject = b;
	});
	promise.status = PENDING;
	let resolve = function(...rArgs) {
		promise.status = RESOLVED;
		vResolve(rArgs);
	};
	let reject = function(...rArgs) {
		promise.status = REJECTED;
		vReject(rArgs);
	};

	try {
		// spanw command
		let p = spawn(...args);

		promise.onData = ev.on.bind(ev, 'data');
		promise.kill = p.kill.bind(p);
		if(p.disconnect) {
			promise.disconnect = p.disconnect.bind(p);
		}

		if(p.send){
			promise.send = p.send.bind(p);
		}
		promise.pid = p.pid;
		promise.__defineGetter__('connected', () => p.connected);
		promise.__defineGetter__('killed', () => p.killed);
		promise.__defineGetter__('stderr', () => p.stderr);
		promise.__defineGetter__('stdin', () => p.stdin);
		promise.__defineGetter__('stdio', () => p.stdio);
		promise.__defineGetter__('stdout', () => p.stdout);

		p.on('data', ev.emit.bind(ev, 'data'));
		p.on('message', ev.emit.bind(ev, 'message'));

		p.on('error', (err) => {
			if(PENDING === promise.status) {
				reject(getErr(args, err));
			}
		});
		let onExit = (code) => {
			if(PENDING === promise.status) {
				if(code === 0) {
					return resolve();
				}
				return reject(getErr(args, code));
			}
		};

		p.on('close', onExit);
		p.on('exit', onExit);

	} catch(e) {
		reject(getErr(args, e));
	}

	return promise;
}
