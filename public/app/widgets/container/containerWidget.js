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

	ContainerWidget.prototype.onActivateScenario = function(scenario, scenarioWidget) {
		this._scenariosWidgets.push(scenarioWidget);
		scenario._widget = scenarioWidget;
		var me = this;
		scenarioWidget.userStatus.subscribe(function() {
			me._scenariosWidgets.notifySubscribers();
		});
	};

	ContainerWidget.prototype.showAllScenarios = function() {
		this.scenarios().forEach(function(scenario) {
			if(!!scenario._widget) {
				scenario._widget.show();
			}
		});
	};

	ContainerWidget.prototype.showScenariosByTags = function(includedTags, excludedTags) {
		if(includedTags.length === 0 && excludedTags.length === 0) {
			return this.showAllScenarios();
		}
		var regexIn = new RegExp(includedTags.join('|'));
		var regexOut = new RegExp(excludedTags.join('|'));
		// if(includedTags.join('|') === '') {
		// 	regexIn.test = function() {return false;}
		// }
		if(excludedTags.join('|') === '') {
			regexOut.test = function() {return false;}
		}

		// console.group('showScenariosByTags')
		// console.log('includedTags', includedTags.join(', '));
		// console.log('excludedTags', excludedTags.join(', '));

		this.scenarios().forEach(function(scenario) {
			if(!!scenario._widget) {
				// console.group('showScenariosByTags: ', scenario.name)

				if(scenario.hasOwnProperty('tags')) {
					// console.log(regexIn.toString() + '.test("' + scenario.tags.join(' ') + '");', regexIn.test(scenario.tags.join(' ')));
					// console.log(regexOut.toString() + '.test("' + scenario.tags.join(' ') + '");', regexOut.test(scenario.tags.join(' ')));

					var scenarioTags = scenario.tags.join(' '),
						isIn = regexIn.test(scenarioTags),
						isOut = regexOut.test(scenarioTags)
					;

					// both regex in true is not an accepted scenario!

					if(isIn) {
						// console.log('is in white: show');
						scenario._widget.show();
					}
					if(isOut) {
						scenario._widget.hide();
						// console.log('isOUT: hide');
					}
					if(!isIn && !isOut) {
						// is not present in any list
						scenario._widget.hide();
						// console.log('not filter?: hide');
					}

				} else {
					// console.log('NoTags: hide');
					scenario._widget.hide(); // if no tags, no shown
				}
				// console.groupEnd();
			}
		});
		// console.groupEnd()
	};

	return ContainerWidget;
});
