const Servlet = require('../core/Servlet');
const url = require('url');
const WebSocket = require('ws');
const EventEmitter = require('events');
LOGGER = new (require('../core/Logger'))('Realtime');

const CLIENTS = [];

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

		this._CID = CLIENTS.push(this)-1;

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
			if(json.e && json.d) {
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
		CLIENTS.splice(this._CID,1);
		this._handler.broadcast('byebye', {CID: this._CID});
		this.emit('browserClose', this);
		this.removeAllListeners();
	}

	_processMessage(json) {
		if(json.hasOwnProperty('to') && json.to > -1) {
			handler.talkTo(json.to, json, this);
		} else {
			this.emit(json.e, json.d);
		}
	}

	send(eventName, data, from) {
		let toSend = {
			e: eventName,
			d: data
		};
		toSend.f = (from) ? from.getCID() : -1;
		try {
			this._ws.send(JSON.stringify(toSend));
		} catch(e) {}
	}
}

class RealtimeServlet extends Servlet {
	_createApp() {
		this._wss = new WebSocket.Server({ server: this._server });
		this._route = '/ws';

		this._wss.on('connection', (ws, req) => {
			const location = url.parse(req.url, true);
			if(location.path.indexOf(this._route) === 0) {
				req.location = location;
				this.onConnection(new Client(ws, this), req);
			}
		});
	}

	onConnection(client, req) {
		LOGGER.debug('Connected!')
		client.on('BROADCAST', data => this.broadcast(data.e, data.d, client));
		client.send('WELCOME', {
			CID: client.getCID(),
			clients: Object.keys(CLIENTS)
		});
	}

	broadcast(eventName, data, from) {
		let fE,
			send = client => {
				LOGGER.debug(`BROADCASTING <${eventName}> to`, client.getCID());
				client.send(eventName, data, from)
			}
		;

		fE = (!!from) ?
			client => ((client !== from) ? send(client) : '') :
			send
		;

		CLIENTS.forEach(fE);
	}

	talkTo(CID, event, from) {
		if(!!CLIENTS[CID]) {
			CLIENTS[CID].send(event.e, event.d, from);
		} else if(from) {
			from.send('DEST_NOT_FOUND', CID);
		}
	}

	serve() {

	}
}

module.exports = RealtimeServlet;
