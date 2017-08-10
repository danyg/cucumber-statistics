const util = require('util');
const fs = require('fs');
const path = require('path');
const TYPE = {
	DEBUG: 0b1000,
	INFO:  0b0100,
	WARN:  0b0010,
	ERROR: 0b0001
};
const LEVEL = {
	DEBUG: TYPE.ERROR | TYPE.WARN | TYPE.INFO | TYPE.DEBUG,
	INFO:  TYPE.ERROR | TYPE.WARN | TYPE.INFO,
	WARN:  TYPE.ERROR | TYPE.WARN,
	ERROR: TYPE.ERROR,
	NONE:  0,
};
const COLOR_TYPE = {};
COLOR_TYPE[TYPE.DEBUG] = '32'; // green
COLOR_TYPE[TYPE.INFO] =  '36'; // cyan
COLOR_TYPE[TYPE.WARN] =  '33'; // yellow/orange
COLOR_TYPE[TYPE.ERROR] = '31'; // red

let TYPE_STR = {};
Object.keys(TYPE).forEach(key => TYPE_STR[ TYPE[key] ] = key);
const DEFAULT_LEVEL = LEVEL.WARN;

let isOn = (type, level) => (level & type) !== 0;
let padr = (str,len) => (str + new Array(len).join(' ')).substring(0,len);
let s = (type) => `${(new Date).toISOString()} \u001b[${COLOR_TYPE[type]}m${padr(TYPE_STR[type], 5)}\u001b[0m:`;
let where = (fileLine) => fileLine ? ` \u001b[36m(${fileLine})\u001b[0m` : '';

class Logger {
	constructor(scope) {
		this._config = {
			level: DEFAULT_LEVEL,
			scopes: {}
		};
		let configFile = path.resolve(process.cwd() + '/.logger.json');
		if(fs.existsSync(configFile)) {
			this._config = JSON.parse(fs.readFileSync(configFile));

			this._config.level = (this._config.hasOwnProperty('level')) ?
				LEVEL[this._config.level.toUpperCase()] :
				DEFAULT_LEVEL
			;
			if(this._config.hasOwnProperty('scopes')) {
				let scopes = Object.keys(this._config.scopes);
				scopes.forEach((scope) => {
					let str = this._config.scopes[scope];
					this._config.scopes[scope] = LEVEL[str.toUpperCase()];
				})
			} else {
				this._config.scopes = {};
			}
		}

		this._outputs = [];
		let outputs = [];
		if(this._config.hasOwnProperty('outputs')) {
			if(typeof this._config.outputs === 'string') {
				outputs.push(this._config.outputs);
			} else {
				outputs = outputs.concat(this._config.outputs);
			}
		} else {
			outputs.push('stdout');
		}

		outputs.forEach((item) => {
			if(item.toLowerCase() === 'stdout') {
				this._outputs.push(process.stdout);
			}
			else if(item.indexOf('file:') === 0) {
				let file = path.resolve(item.substring(5, item.length));
				this._outputs.push(fs.createWriteStream(file, {
					flags: 'a'
				}));
			}
		});

		this._config.scope = scope;
		this.TYPE = TYPE;
		this.LEVEL = LEVEL;
	}

	setLevel(level) {
		this._config.level = level;
	}

	_sniffStdOut() {
		if(!process.stdout.hasOwnProperty('directWrite')) {

			process.stdout.directWrite = process.stdout.write.bind(process.stdout);

			if(this._config.showAllTraces) {
				var logger = this;
				process.stdout.write = function(str){
					let fileLine = logger._getFileLine(process.stdout.write);
					var tmp = str.split('\n');
					var last = tmp.pop();
					str = tmp.join('\n') + `${where(fileLine)}\n` + last;
					return this.directWrite(str);
				}
			}
		}
	}

	_getStackTrace(caller) {
		this._sniffStdOut();
		let err = {};
		Error.captureStackTrace(err, caller);
		let stack = '<unknown>';
		try {
			stack = err.stack.replace(new RegExp(process.cwd(), 'g'), '')
			stack = err.stack.split('\n')
			stack.splice(0,1);
			stack = 'STACK TRACE:\n' + stack.join('\n')
		} catch(e){}
		return stack;
	}

	_getFileLine(caller) {
		this._sniffStdOut();
		let err = {};
		Error.captureStackTrace(err, caller);
		let fileLine = '<unknown>';
		try {
			fileLine = err.stack.split('\n')[1].trim();
			fileLine = fileLine.replace(process.cwd(), '.');
		} catch(e){}
		return fileLine;
	}

	_isOn(scope, type) {
		let level = this._config.level;
		if(this._config.scopes.hasOwnProperty(scope)) {
			level = this._config.scopes[scope];
		}
		return isOn(type, level);
	}

	_write(type, caller, ...args) {
		if(this._isOn(this._config.scope, type)) {
			let fileLine = (this._config.showTrace) ? this._getFileLine(caller) : '';
			let msg = `${s(type)} [${this._config.scope}] ${util.format.apply(null, args)}${where(fileLine)}\n`;
			this._outputs.forEach(out => out[ (out.hasOwnProperty('directWrite') ? 'directWrite' : 'write') ](msg));
		}
	}

	trace (...args) {
		args.length > 0 ? args.push('\n') : '';
		this._write(TYPE.DEBUG, this.trace, `${util.format.apply(null, args)}${this._getStackTrace(this.trace)}`);
		return this;
	}

	debug (...args) { this._write(TYPE.DEBUG, this.debug, ...args); return this;}
	log   (...args) { this._write(TYPE.DEBUG, this.log  , ...args); return this;}
	info  (...args) { this._write(TYPE.INFO , this.info , ...args); return this;}
	warn  (...args) { this._write(TYPE.WARN , this.warn , ...args); return this;}
	error (...args) { this._write(TYPE.ERROR, this.error, ...args); return this;}
}

global.LOGGER = new Logger('global');

module.exports = Logger;
