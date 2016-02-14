define([
], function() {

	'use strict';

	function LoadingWidget() {
	}

	LoadingWidget.prototype.activate = function(settings) {
		// settings.bindingContext.$widget = this;

		this._settings = settings;
		this.enable = this._settings.enable;
		this.hover = this._settings.hover;

		return true;
	};

	return LoadingWidget;
});