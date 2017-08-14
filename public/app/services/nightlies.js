define(['plugins/http'], function(http) {
	'use strict';

	function Nightlies() {
		this._cache = null;
		this._index = {};
	}

	Nightlies.prototype.get = function() {

		if(this._cache) {
			return Promise.resolve(this._cache);
		}

		return http.get('/nightlies')
			.then(
				this._onData.bind(this)
			)
		;
	};

	Nightlies.prototype.getNightlyById = function(id) {
		return this.get()
			.then((function() { return this._index.hasOwnProperty(id) ? this._index[id] : false; }).bind(this))
		;
	};

	Nightlies.prototype._onData = function(nightlies) {
		this._cache = nightlies.map((function(nightly){
			this._index[nightly._id] = nightly;
			nightly.name = nightly._id;
			return nightly;
		}).bind(this));
		return this._cache;
	};

	return new Nightlies();
});