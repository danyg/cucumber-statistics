define([
	'knockout',
	'durandal/system',
	'jquery',
	'plugins/http',

	'nightly/nightly'
], function(
	ko,
	system,
	$,
	http,

	nightlyController
) {

	'use strict';

	function ContainerWidget() {
		this.title = ko.observable();
		this.scenarios = ko.observableArray();
		this._isLoading = ko.observable(false);
	}

	ContainerWidget.prototype.activate = function(settings) {
		settings.bindingContext.$widget = this;

		this._settings = settings;
		this.title(this._settings.title);
	};

	ContainerWidget.prototype.attached = function() {
		return this._call(this._settings.type, this._settings.method).promise();
	};

	ContainerWidget.prototype.compositionComplete = function() {
		this._isLoading(false);
	};

	ContainerWidget.prototype._call = function(type, method) {
		this._isLoading(true);
		return http.get('/results/' + nightlyController.nightlyId() + '/' + type + '/' + method)
			.then(
				this._onData.bind(this),
				this._onError.bind(this)
			)
		;
	};

	ContainerWidget.prototype._onData = function(data) {
		this.scenarios(data);
	};

	ContainerWidget.prototype._onError = function() {
		// do something
		this._isLoading(false);
	};

	return ContainerWidget;
});