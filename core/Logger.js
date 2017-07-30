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
			level: DEFAULT_LEVEL
		};
		let configFile = path.resolve(process.cwd() + '/.logger.json');
		if(fs.existsSync(configFile)) {
			this._config = JSON.parse(fs.readFileSync(configFile));
			if(this._config.hasOwnProperty('level')) {
				this._config.level = LEVEL[this._config.level.toUpperCase()];
			} else {
				this._config.level = DEFAULT_LEVEL;
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

	_getFileLine(caller) {
		this._sniffStdOut();
		let err = {};
		Error.captureStackTrace(err, caller);
		var fileLine = '<unknown>';
		try {
			fileLine = err.stack.split('\n')[1].trim();
			fileLine = fileLine.replace(process.cwd(), '.');
		} catch(e){}
		return fileLine;
	}

	_write(type, caller, ...args) {
		if(isOn(type, this._config.level)) {
			let fileLine = (this._config.showTrace) ? this._getFileLine(caller) : '';
			let msg = `${s(type)} [${this._config.scope}] ${util.format.apply(null, args)}${where(fileLine)}\n`;
			this._outputs.forEach(out => out[ (out.hasOwnProperty('directWrite') ? 'directWrite' : 'write') ](msg));
		}
	}

	debug (...args) { this._write(TYPE.DEBUG, this.debug, ...args); }
	log   (...args) { this._write(TYPE.DEBUG, this.log  , ...args); }
	info  (...args) { this._write(TYPE.INFO , this.info , ...args); }
	warn  (...args) { this._write(TYPE.WARN , this.warn , ...args); }
	error (...args) { this._write(TYPE.ERROR, this.error, ...args); }
}

global.LOGGER = new Logger('global');

module.exports = Logger;
