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
		var me = this;
		this.title = ko.observable();
		this.scenarios = ko.observableArray();
		this._isLoading = ko.observable(false);
		this._frameless = ko.observable(false);
		this.showCheckbox = ko.observable(true);
		this.nightlyId = ko.observable();

		this.passedScenariosLength = ko.observable(0);
		this.hiddenScenariosLength = ko.observable(0);

		this.showHiddenElements = ko.observable(false);
		this.hidePassedElements = ko.observable(false);

		this._scenariosWidgets = ko.observableArray();;

		this._scenariosWidgets.subscribe(function() {
			var lPassed = 0,
				lHidden = 0
			;
			if(!!me._scenariosWidgets()) {
				me._scenariosWidgets().forEach(function(scenarioWidget) {
					lPassed += scenarioWidget.status() === 'passed' ? 1 : 0;

					lHidden += (scenarioWidget.userStatus() === 'auto-fix' ||
						scenarioWidget.userStatus() === 'fix') ? 1 : 0
					;
				});
			}

			me.passedScenariosLength(lPassed);
			me.hiddenScenariosLength(lHidden);
		});
	}

	ContainerWidget.prototype.activate = function(settings) {
		settings.bindingContext.$widget = this;

		this._settings = settings;
		this._frameless(!!this._settings.frameless);

		this.scenarios(null);
		if(this._settings.hasOwnProperty('data')) {
			this.scenarios(this._settings.data);
		}
		this.nightlyId(!!this._settings.nightlyId ?
			this._settings.nightlyId :
			nightlyController.nightlyId()
		);

		if(this._settings.method === 'getMostTimeConsuming') {
			this.showHiddenElements(true);
			this.showCheckbox(false);
		}

		this.title(this._settings.title);
	};

	ContainerWidget.prototype.attached = function() {
		if(this.scenarios() === null) {
			return this._call(this._settings.type, this._settings.method).promise();
		}
	};

	ContainerWidget.prototype.compositionComplete = function() {
		this._isLoading(false);
	};

	ContainerWidget.prototype._call = function(type, method) {
		this._isLoading(true);
		return http.get('/results/' + this.nightlyId() + '/' + type + '/' + method)
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

	ContainerWidget.prototype.onActivateScenario = function(scenarioWidget) {
		this._scenariosWidgets.push(scenarioWidget);
		var me = this;
		scenarioWidget.userStatus.subscribe(function() {
			me._scenariosWidgets.notifySubscribers();
		})
	};

	return ContainerWidget;
});