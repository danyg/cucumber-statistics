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
		this.includedTags = ko.observableArray();
		this.excludedTags = ko.observableArray();
		this._isLoading = ko.observable(false);
		this._filterActivated = ko.observable(false);
		this.filterFilter = ko.observable('');

		this.includedTags.subscribe(this._filterByTags.bind(this));
		this.excludedTags.subscribe(this._filterByTags.bind(this));

		this.filterFilter.subscribe(this._filterShownTags.bind(this));
	}

	LastExecution.prototype.activate = function() {
		this._filterActivated(false);
		var dfd = system.defer();
		this._call().then(
			this._onData.bind(this, dfd),
			this._onError.bind(this, dfd)
		);
		return dfd.promise();
	};

	LastExecution.prototype.attached = function(view) {
		this._viewElm = view;
	};

	LastExecution.prototype._call = function() {
		this._isLoading(true);
		return http.get('/lastExecution');
	};

	LastExecution.prototype._onData = function(dfd, data) {
		this._filterActivated(false);
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

		this._isLoading(false);
		dfd.resolve();
	};

	LastExecution.prototype._onError = function(dfd) {
		// do something
		this._isLoading(false);
		dfd.reject();
	};

	LastExecution.prototype._onWidgetActivated = function(child, parent, context) {
		this._containerWidget = context.model;
		this._filterActivated(true);
		this._filterByTags();
	};

	LastExecution.prototype._filterByTags = function() {
		if(this._filterActivated()) {
			this._filterActivated(false);
			// clean tags that are in both lists
			var dual = this.includedTags().filter((function(item){
				return this.excludedTags().indexOf(item) !== -1
			}).bind(this));
			dual.forEach((function(item){
				this.includedTags.splice( this.includedTags.indexOf(item) ,1);
				this.excludedTags.splice( this.excludedTags.indexOf(item) ,1);
			}).bind(this));

			this._containerWidget.showScenariosByTags(this.includedTags(), this.excludedTags());

			this._filterActivated(true);
		}
	};

	LastExecution.prototype._filterShownTags = function() {
		var search = this.filterFilter().replace('@', '');
		if(search.trim() !== '') {
			$('.tag-filters .tags-list li', this._viewElm).hide();
			$('.tag-filters .tags-list li[rel*="' + search + '"]', this._viewElm).show();
		} else {
			$('.tag-filters .tags-list li', this._viewElm).show();
		}
	}

	return new LastExecution();
});
