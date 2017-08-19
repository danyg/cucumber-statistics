define([
	'knockout',

	'./Filter',

	'lib/utils',
	'knockout-sortablejs'
], function (
	ko,

	Filter,

	utils
	// ,sortable,
) {

	'use strict';

	function Filters() {
		this.tags = null; // borrowed;
		this._theirsFilterActivated = ko.observable(true); // borrowed;
		this._filterActivated = ko.observable(false); // borrowed;
		this.filterActivated = ko.computed({
			read: (function(){
				return this._filterActivated() && this._theirsFilterActivated();
			}).bind(this),
			write: (function(val){
				this._filterActivated(val);
			}).bind(this)
		});

		this.filterFilter = ko.observable('');

		this.includedTags = ko.observableArray();
		this.excludedTags = ko.observableArray();

		this.includedTags.subscribe(this._filterByTags.bind(this));
		this.excludedTags.subscribe(this._filterByTags.bind(this));

		this.filterFilter.subscribe(this._filterShownTags.bind(this));
		this._subscriptions = [];

		this.filter = Filter.ROOT;
		this.filter.add(new Filter('@Quarantine', Filter.ACTION_RMV))
		this.filter.add(new Filter([
			new Filter('@CreditCard', Filter.ACTION_ADD),
			new Filter('@Invoice', Filter.ACTION_ADD)
		]));
		this.filter.add(new Filter('@HappyPath', Filter.ACTION_ADD));

		window.FILTER = this.filter;
	}

	Filters.prototype.activate = function(settings) {
		this._containerWidget = [];
		settings.bindingContext.$widget = this;

		this.tags = settings.tags;
		if(settings.filterActivated){
			this._theirsFilterActivated = settings.filterActivated;
		}
	};

	Filters.prototype.detached = function() {
		utils.disposeSubscriptions(this._subscriptions);
	};

	Filters.prototype.addContainerWidget = function(containerWidget) {
		this._containerWidget.push(containerWidget);
		return this;
	};

	Filters.prototype.start = function() {
		this._filterActivated(true);
		this._filterByTags();
		return this;
	};

	Filters.prototype._filterByTags = function() {
		if(this.filterActivated()) {
			this._filterActivated(false);
			// clean tags that are in both lists
			var dual = this.includedTags()
				.filter((function(item){
					return this.excludedTags().indexOf(item) !== -1
				}).bind(this))
			;

			dual.forEach((function(item){
				this.includedTags.splice( this.includedTags.indexOf(item) ,1);
				this.excludedTags.splice( this.excludedTags.indexOf(item) ,1);
			}).bind(this));

			this._containerWidget.forEach((function(container){
				container.onReady((function(){
					container.showScenariosByTags(
						this.includedTags(),
						this.excludedTags()
					);
				}).bind(this))
			}).bind(this));

			this._filterActivated(true);
		}
	};

	Filters.prototype._filterShownTags = function() {
		var search = this.filterFilter().replace('@', '');
		if(search.trim() !== '') {
			$('.tag-filters .tags-list dd', this._viewElm).hide();
			$('.tag-filters .tags-list dd[rel*="' + search + '"]', this._viewElm).show();
		} else {
			$('.tag-filters .tags-list dd', this._viewElm).show();
		}
	};

	return Filters;
});
