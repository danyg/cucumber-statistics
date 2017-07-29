define([
	'knockout'
], function(
	ko
) {

	'use strict';

	var TI_SUFFIX = 'spinner';

	function LoadingWidget() {
	}

	LoadingWidget.prototype.activate = function(settings) {
		// settings.bindingContext.$widget = this;

		this._settings = settings;
		this.enable = this._settings.enable;
		this.hover = this._settings.hover;
		this._prepareTestId(this._settings.testId);

		return true;
	};

	LoadingWidget.prototype._prepareTestId = function(testId) {
		var getTestId = function(tI) {
			if(typeof tI === 'string') {
				return [tI, TI_SUFFIX];
			} else {
				return tI.push(TI_SUFFIX);
			}
		};
		if(ko.isObservable(testId)) {
			this.testId = ko.computed((function() {
				return getTestId(testId());
			}).bind(this));
		} else {
			this.testId = getTestId(testId);
		}
	}

	return LoadingWidget;
});