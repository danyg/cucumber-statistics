define([
	'knockout'
], function(
	ko
) {

	'use strict';

	function Nightly() {
		this.nightlyId = ko.observable();
	}

	Nightly.prototype.activate = function(nightlyId) {
		this.tags = ko.observableArray();
		this._dfds = {
			unstables: Promise.deferred(),
			timeConsuming: Promise.deferred(),
			filters: Promise.deferred()
		};
		this._widgets = {};

		Promise.all(
				Object.keys(this._dfds).map((function(key){
					return this._dfds[key].promise()
				}).bind(this))
			)
			.then(this._startFilters.bind(this))
		;

		this.nightlyId(nightlyId);
		console.log('Nightly REACTIVATED', nightlyId);
		return true;
	};

	Nightly.prototype._onWidgetAttached = function(widgetName, child, parent, context) {
		this._widgets[widgetName] = context.model;
		this._dfds[widgetName].resolve(context.model);
	};

	Nightly.prototype._startFilters = function() {
		this._widgets.filters
			.addContainerWidget(this._widgets.unstables)
			.addContainerWidget(this._widgets.timeConsuming)
			.start()
		;
	};

	return new Nightly();
});