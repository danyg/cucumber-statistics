define([
	'knockout',
	'durandal/system',
	'plugins/http',
	'jquery'
], function(
	ko,
	system,
	http,
	$
) {

	'use strict';

	function LastExecution() {
		this.nightlies = ko.observableArray();
		this.scenarios = ko.observableArray();
		this.tags = ko.observableArray();
		this.filterActivated = ko.observable(false);

		this._isLoading = ko.observable(false);
	}

	LastExecution.prototype.activate = function() {
		this._dfds = {
			container: Promise.deferred(),
			filters: Promise.deferred(),
			activate: Promise.deferred(),
		};
		this._dfds.all = Promise.all([
				this._dfds.container.promise(),
				this._dfds.filters.promise(),
				this._dfds.activate.promise()
			])
			.then(
				this._startFilters.bind(this)
			)
		;

		this.filterActivated(false);
		this._call().then(
			this._onData.bind(this),
			this._onError.bind(this)
		);
		return this._dfds.activate.promise();
	};

	LastExecution.prototype.attached = function(view) {
		this._viewElm = view;
	};

	LastExecution.prototype._call = function() {
		this._isLoading(true);
		return http.get('/lastExecution');
	};

	LastExecution.prototype._onData = function(data) {
		this.filterActivated(false);
		this.scenarios.removeAll();
		this.tags.removeAll();

		var forEachTag = (function(tag){
			if(this.tags.indexOf(tag) === -1) {
				this.tags.push(tag);
			}
		}).bind(this);

		var forEachScenario = (function(nightly, scenario) {
			if(!!scenario.results) {
				scenario.results.sort(function(a,b) {
					return a.buildId - b.buildId;
				});
			}


			var lE = !!scenario.results && scenario.results.length ? scenario.results[scenario.results.length -1] : null;
			if(!!lE && lE.buildId === nightly.build) {
				scenario._parent = nightly;
				this.scenarios.push(scenario);
				if(scenario.hasOwnProperty('tags')) {
					scenario.tags.forEach(forEachTag);
				}
			}
		}).bind(this);

		data.forEach((function(nightly) {
			nightly.scenarios.forEach(forEachScenario.bind(this, nightly));
		}).bind(this));

		this.tags.sort();
		this.filterActivated(true);

		this._isLoading(false);
		this._dfds.activate.resolve();
	};

	LastExecution.prototype._onError = function() {
		// do something
		this._isLoading(false);
		this._dfds.activate.reject();
	};

	LastExecution.prototype._onContainerAttached = function(child, parent, context) {
		this._containerWidget = context.model;
		this._dfds.container.resolve();
	};

	LastExecution.prototype._onFiltersAttached = function(child, parent, context) {
		this._filterWidget = context.model;
		this._dfds.filters.resolve();
	};

	LastExecution.prototype._startFilters = function() {
		this._filterWidget
			.addContainerWidget(this._containerWidget)
			.start()
		;
	};


	return new LastExecution();
});
