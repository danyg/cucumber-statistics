define(['durandal/events'], function(Events){

	var RETRY_TIME = 15;

	function Realtime() {
		this._wsServerUrl = 'ws://' + window.document.location.host + '/ws'
		this._connect();

		this.on('WELCOME', this._sayHello.bind(this));
		this.on('hello', this._onNewSibling.bind(this));
		this.on('byebye', this._onSiblingOut.bind(this));
	}

	Events.includeIn(Realtime.prototype);

	Realtime.prototype.send = function(eventName, data) {
		this._ws.send(JSON.stringify({e: eventName, d: data}));
	};

	Realtime.prototype.sendTo = function(CID, eventName, data) {
		this._ws.send(JSON.stringify({e: eventName, d: data, to: CID}));
	};

	Realtime.prototype.broadcast = function(eventName, data) {
		this.send('BROADCAST', {e: eventName, d:data});
	};

	Realtime.prototype.getNextReconnectionTime = function() {
		return this._connectRetryTs;
	};

	Realtime.prototype._connect = function() {
		clearTimeout(this._connectRetryTm);

		this._ws = new WebSocket(this._wsServerUrl);
		this._ws.addEventListener('error', this._onError.bind(this));
		this._ws.addEventListener('open', this._onOpen.bind(this));
		this._ws.addEventListener('message', this._onMessage.bind(this));
		this._ws.addEventListener('close', this._onClose.bind(this));
	};

	Realtime.prototype._reconnect = function(e) {
		console.error('Error trying to connect to <' + this._wsServerUrl + '> retrying in ' + RETRY_TIME + 's Error received:', e);
		this._connectRetryTs = (parseInt(Date.now()/1000,10)*1000) + RETRY_TIME * 1000;
		this._connectRetryTm = setTimeout(this._connect.bind(this), RETRY_TIME * 1000);
	};

	Realtime.prototype._onOpen = function() {
		this._connected = true;
		this.trigger('CONNECTED');
	};

	Realtime.prototype._onClose = function(e) {
		var c = this._connected;
		this._connected = false;
		this._reconnect(e);
		if(c === true) {
			this.trigger('DISCONNECTED');
		}
	};

	Realtime.prototype._onError = function(e) {
		switch (e.code){
			case 'ECONNREFUSED':
				this._onClose(e);
			break;
		}
	};

	Realtime.prototype._onMessage = function(msgEvent) {
		try {
			var json = JSON.parse(msgEvent.data);
			if(json.e && json.d) {
				this._processMessage(json);
			} else {
				throw new TypeError('json not compatible, missing event property');
			}
		} catch(e) {
			console.warn('Error parsing WS data from server',e);
			return;
		}
	}

	Realtime.prototype._processMessage = function(json) {
		this.trigger(json.e, json.d);
	};

	Realtime.prototype._sayHello = function(data) {
		this._CID = data.CID;
		this._clients = data.clients;

		this.broadcast('hello', {
			CID: data.CID
		});
	};

	Realtime.prototype._onNewSibling = function(data) {
		this._clients.push(data.CID);
	};

	Realtime.prototype._onSiblingOut = function(data) {
		var pos = this._clients.indexOf(data.CID);
		if(pos > -1) {
			this._clients.splice(pos,1);
		}
	}

	return new Realtime();

});