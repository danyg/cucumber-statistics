define([
	'knockout',

	'lib/Modificator',
	'config/dictionary',
	'lib/utils'
], function(
	ko,

	Modificator,
	dictionary,
	utils
) {

	'use strict';

	function ScenarioStepWidget() {
		this.dictionary = dictionary;
		this.id = ko.observable();
		this.name = ko.observable();
		this.status = ko.observable();
		this.duration = ko.observable(false);
		this.keyword = ko.observable();
		this.images = ko.observableArray();
		this.output = ko.observable('');
		this.expanded = ko.observable(false);

		this.modificators = ko.observableArray([]);

		this.expandable = ko.computed((function() {
			return (this.output().length || this.images().length > 0);
		}).bind(this));
		this.cssClasses = ko.computed((function() {
			return this.status()
				+ (this.expandable() ? ' expandable important' : ' not-important')
				+ (this.expanded() ? ' expanded' : '')
			;
		}).bind(this));
	}

	ScenarioStepWidget.prototype.activate = function(settings) {
		settings.bindingContext.$widget = this;

		this._settings = settings;

		var step = this._settings.step;
		this.id(step.id);
		this.keyword(step.keyword);
		this.name(step.name);
		this.duration(utils.cucumberTimeToHuman(step.duration, false));
		if(!!step.extraInfo) {
			this.output(step.extraInfo.html || '');
			this.images(step.extraInfo.imgs || []);
		}

		this.status(step.status);

		this._processModificators();

		return true;
	};


	ScenarioStepWidget.prototype.attached = function(view) {
		this.$element = $(view);
	};

	ScenarioStepWidget.prototype.toggleExpand = function() {
		if(!this.expandable()) {
			return;
		}
		this.expanded(!this.expanded());
		var panel = $('>.panel', this.$element);

		if(!this.expanded()) {
			panel.css('height', 'initial');
		}

	};

	ScenarioStepWidget.prototype._processModificators = function() {
		if(this.images().length > 0) {
			this.modificators.push(new Modificator('with-image'));
		}
		if(this.output().length > 0) {
			this.modificators.push(new Modificator('with-output'));
		}



		if(this.duration()) {
			var dur = new Modificator('time');
			dur.setText(this.duration())
				.setTitle('Duration: ' + this.duration())
			;
			this.modificators.push(dur);
		}
	};

	return ScenarioStepWidget;
});