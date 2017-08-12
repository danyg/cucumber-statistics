let nCID = 0;

class Clients {
	constructor() {
		this._clients = {};
	}

	exists(CID) {
		return this._clients.hasOwnProperty(CID);
	}

	get(CID) {
		return this._clients[CID];
	}

	add(client) {
		const CID = nCID++;
		this._clients[CID] = client;
		return CID;
	}

	remove(CID) {
		if(this.exists(CID)) {
			delete this._clients[CID];
		}
		return this;
	}

	getListOfClients() {
		return Object.keys(this._clients);
	}


	forEach(cbk) {
		let keys = this.getListOfClients();
		keys.forEach(i => cbk(this._clients[i], keys[i]));
		return this;
	}
}

module.exports = new Clients();
