define([
	'knockout',
	'durandal/system',
	'plugins/http'
], function(
	ko,
	system,
	http
) {

	'use strict';

	function LastExecution() {
		this.nightlies = ko.observableArray();
		this._isLoading = ko.observable(false);
	}

	LastExecution.prototype.activate = function() {
		var dfd = system.defer();
		this._call().then(
			this._onData.bind(this, dfd),
			this._onError.bind(this, dfd)
		);
		return dfd.promise();
	};

	LastExecution.prototype._call = function() {
		this._isLoading(true);
		return http.get('/lastExecution');
	};

	LastExecution.prototype._onData = function(dfd, data) {
		this.nightlies(data);
		this._isLoading(false);
		dfd.resolve();
	};

	LastExecution.prototype._onError = function(dfd) {
		// do something
		this._isLoading(false);
		dfd.reject();
	};

	return new LastExecution();
});