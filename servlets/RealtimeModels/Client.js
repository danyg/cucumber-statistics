LOGGER = new (require('../../core/Logger'))('Realtime.Client');

const EventEmitter = require('events');
const CLIENTS = require('./clients')

class Client extends EventEmitter {
	constructor(ws, handler) {
		super();
		this._ws = ws;
		this._handler = handler;
		// EVENTS:
		// close
		// error
		// headers
		// message
		// open
		// ping
		// pong
		// unexpected-response


		this._CID = CLIENTS.add(this);

		this._subscribe();
	}

	getCID() {
		return this._CID;
	}

	_subscribe() {
		this._ws.addEventListener('message', this._onMessage.bind(this));
		this._ws.addEventListener('close', this._onClose.bind(this));
	}

	_onMessage(msgEvent) {
		try {
			let json = JSON.parse(msgEvent.data);
			if(json.e) {
				this._processMessage(json);
			} else {
				throw new TypeError('json not compatible, missing event property');
			}
		} catch(e) {
			LOGGER.warn('Error parsing WS data from client',e);
			return;
		}
	}

	_onClose() {
		LOGGER.debug('REMOVING', this._CID);
		CLIENTS.remove(this._CID);

		this._handler.broadcast('byebye', {CID: this._CID});
		this.emit('browserClose', this);

		this.removeAllListeners();
	}

	_processMessage(json) {
		if(json.hasOwnProperty('to')) {
			this._handler.talkTo(json.to, json, this);
		} else {
			this.emit(json.e, json.d);
		}
	}

	send(eventName, data, from) {
		let toSend = {
			e: eventName,
			d: data
		};
		if(from) { toSend.f = from.getCID(); }
		try {
			this._ws.send(JSON.stringify(toSend));
		} catch(e) {}
	}
}

module.exports = Client;
