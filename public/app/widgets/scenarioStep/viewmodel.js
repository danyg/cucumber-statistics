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
	}

	ScenarioStepWidget.prototype.activate = function(settings) {
		settings.bindingContext.$widget = this;

		this._settings = settings;

		var step = this._settings.step;
		this.id(step.id);
		this.keyword(step.keyword);
		this.name(step.name);
		this.status(step.status);

		return true;
	};

	return ScenarioStepWidget;
});