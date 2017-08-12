const Servlet = require('../core/Servlet');
const url = require('url');
const WebSocket = require('ws');
LOGGER = new (require('../core/Logger'))('RealtimeServlet');

const Client = require('./RealtimeModels/Client');
const CLIENTS = require('./RealtimeModels/clients');

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
			clients: CLIENTS.getListOfClients()
		});
	}

	broadcast(eventName, data, from) {
		LOGGER.debug('broadcasting', eventName);
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
		if(!!CLIENTS.exists(CID)) {
			CLIENTS.get(CID).send(event.e, event.d, from);
		} else if(from) {
			from.send('DEST_NOT_FOUND', CID);
		}
	}

	serve() {

	}
}

module.exports = RealtimeServlet;
