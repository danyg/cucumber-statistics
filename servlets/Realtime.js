const Servlet = require('../core/Servlet');
const url = require('url');
const WebSocket = require('ws');

class RealtimeServlet extends Servlet {
	_createApp() {
		this._wss = new WebSocket.Server({ server: this._server });
		this._route = '/ws';

		this._wss.on('connection', (ws, req) => {
			const location = url.parse(req.url, true);
			if(location.uri.indexOf(this._route) === 0) {
				req.location = location;
				this.onConnection(ws, req);
			}
		});
	}

	onConnection(ws, req) {
		ws.send('welcome');
	}

	serve() {

	}
}

module.exports = RealtimeServlet;
