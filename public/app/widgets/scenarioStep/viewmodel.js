define([
	'knockout'
], function(
	ko
) {

	'use strict';

	function ScenarioStepWidget() {
		this.id = ko.observable();
		this.name = ko.observable();
		this.status = ko.observable();
		this.keyword = ko.observable();
		this.images = ko.observableArray();
		this.output = ko.observable('');
		this.expanded = ko.observable(false);

		var me = this;
		this.expandable = ko.computed(function() {
			return (me.output().length || me.images().length > 0);
		});
		this.cssClasses = ko.computed(function() {
			return me.status()
				+ (me.images().length > 0 ? ' with-image' : '')
				+ (me.output().length > 0 ? ' with-output' : '')
				+ (me.expandable() ? ' expandable important' : ' not-important')
			;
		});
	}

	ScenarioStepWidget.prototype.activate = function(settings) {
		settings.bindingContext.$widget = this;

		this._settings = settings;

		var step = this._settings.step;
		this.id(step.id);
		this.keyword(step.keyword);
		this.name(step.name);
		this.output(step.extraInfo.html || '');
		this.images(step.extraInfo.imgs || []);

		this.status(step.status);

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

		if(this.expanded()) {


			if(this.steps().length === 0) {
				this.steps(this._settings.scenario.steps);
			} else {
				var h = panel.height();
				panel
					.addClass('hidden no-trans')
					.css('height', h)
				;
				setTimeout(function() {
					panel.removeClass('hidden no-trans');
				}, 10);
			}
		} else {
			panel.css('height', 'initial');
		}

	};

	return ScenarioStepWidget;
});