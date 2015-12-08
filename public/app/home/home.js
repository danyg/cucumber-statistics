define([
	'knockout',
	'plugins/http',
	'plugins/router'
], function(
	ko,
	http,
	router
) {

	'use strict';

	function Home() {
		this.nightlies = ko.observableArray();
		this.errorMsg = ko.observable('');
		this.getData();
		this._router = router;
	}

	Home.prototype.getData = function() {
		this.errorMsg('');
		this.promise = http.get('/nightlies')
			.then(
				this._onData.bind(this),
				this._onFailure.bind(this)
			)
			.promise()
		;
	};

	Home.prototype.activate = function() {
		return this.promise;
	};

	Home.prototype._onData = function(data) {
		this.nightlies(data);
	};

	Home.prototype._onFailure = function(/*jqXHR, status, responseText*/) {
		this.errorMsg('Not nightlies founded');
	};

	Home.prototype.isRouteActive = function(fragment) {
		return this._router.activeInstruction().fragment === fragment;
	};

	return new Home();
});