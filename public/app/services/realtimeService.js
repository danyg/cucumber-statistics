define(['durandal/events'], function(Events){

	var RETRY_TIME = 15;
	var STATUS_DISCONNECTED = 'disconnected',
		STATUS_CONNECTED    = 'connected',
		STATUS_RECONNECTING = 'reconnecting'
	;

	function Realtime() {
		this._wsServerUrl = 'ws://' + window.document.location.host + '/ws'
		this.status = STATUS_DISCONNECTED;
		this._queue = [];

		this.on('WELCOME', this._sayHello.bind(this));
		this.on('hello', this._onNewSibling.bind(this));
		this.on('byebye', this._onSiblingOut.bind(this));
	}

	Events.includeIn(Realtime.prototype);

	Realtime.prototype.emit = Realtime.prototype.trigger;

	Realtime.prototype._enqueueIfNotConnected = function(method, args) {
		if(this.status !== STATUS_CONNECTED) {
			this._queue.push([method, args]);
			return false;
		}
		return true;
	}

	Realtime.prototype.getCID = function() {
		return this._CID;
	};

	Realtime.prototype.send = function(eventName, data) {
		if(this._enqueueIfNotConnected('send', arguments)) {
			this._ws.send(JSON.stringify({e: eventName, d: data}));
		}
	};

	Realtime.prototype.sendTo = function(CID, eventName, data) {
		if(this._enqueueIfNotConnected('sendTo', arguments)) {
			this._ws.send(JSON.stringify({e: eventName, d: data, to: CID}));
		}
	};
	Realtime.prototype.talkTo = Realtime.prototype.sendTo;

	Realtime.prototype.broadcast = function(eventName, data) {
		if(this._enqueueIfNotConnected('broadcast', arguments)) {
			this.send('BROADCAST', {e: eventName, d:data});
		}
	};

	Realtime.prototype.getNextReconnectionTime = function() {
		return this._connectRetryTs;
	};

	Realtime.prototype.connect = function() {
		clearTimeout(this._connectRetryTm);

		if(!this._connected) {
			this._ws = new WebSocket(this._wsServerUrl);
			this._ws.addEventListener('error', this._onError.bind(this));
			this._ws.addEventListener('open', this._onOpen.bind(this));
			this._ws.addEventListener('message', this._onMessage.bind(this));
			this._ws.addEventListener('close', this._onClose.bind(this));
		}
	};

	Realtime.prototype._reconnect = function(e) {
		this.status = STATUS_RECONNECTING;
		console.error('Error trying to connect to <' + this._wsServerUrl + '> retrying in ' + RETRY_TIME + 's Error received:', e);
		this._connectRetryTs = (parseInt(Date.now()/1000,10)*1000) + RETRY_TIME * 1000;
		this._connectRetryTm = setTimeout(this.connect.bind(this), RETRY_TIME * 1000);
	};

	Realtime.prototype._onOpen = function() {
		this.status = STATUS_CONNECTED;
		this._connected = true;

		if(this._queue.length > 0) {
			this._queue.forEach((function(cmd) {
				try {
					this[cmd[0]].apply(this, cmd[1]);
				} catch(e) {}
			}).bind(this));
			this._queue.splice(0, this._queue.length-1);
		}

		this.emit('CONNECTED');
	};

	Realtime.prototype._onClose = function(e) {
		var c = this._connected;
		this._connected = false;
		this._reconnect(e);
		if(c === true) {
			this.emit('DISCONNECTED');
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
			if(json.e) {
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
		try {
			this.emit(json.e, json.d, json.f);
		} catch(e) {
			console.error('Error in listener for event ' + json.e, e);
		}
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