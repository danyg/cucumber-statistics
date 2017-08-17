define([
	'knockout',
	'durandal/system',
	'durandal/events',
	'jquery',
	'plugins/http',

	'modules/nightly/nightly'
], function(
	ko,
	system,
	Events,
	$,
	http,

	nightlyController
) {

	'use strict';

	function ContainerWidget() {
		this._ready = false;

		this.title = ko.observable();
		this.scenarios = ko.observableArray();
		this._isLoading = ko.observable(false);
		this._frameless = ko.observable(false);
		this.showCheckbox = ko.observable(true);
		this.nightlyId = ko.observable();

		this.expanded = ko.observable(true);

		this.passedScenariosLength = ko.observable(0);
		this.hiddenScenariosLength = ko.observable(0);

		this.showHiddenElements = ko.observable(false);
		this.hidePassedElements = ko.observable(false);

		this._scenariosWidgets = ko.observableArray();

		this._scenariosWidgets.subscribe((function() {
			var lPassed = 0,
				lHidden = 0
			;
			if(!!this._scenariosWidgets()) {
				this._scenariosWidgets().forEach((function(scenarioWidget) {
					lPassed += scenarioWidget.status() === 'passed' ? 1 : 0;

					lHidden += scenarioWidget.isInHiddenStatus() ? 1 : 0;
					// lHidden += (scenarioWidget.userStatus() === 'auto-fix' ||
					// 	scenarioWidget.userStatus() === 'fix') ? 1 : 0
					// ;
				}).bind(this));
			}

			this.passedScenariosLength(lPassed);
			this.hiddenScenariosLength(lHidden);
		}).bind(this));
	}

	Events.includeIn(ContainerWidget.prototype);

	ContainerWidget.prototype.onReady = function(cbk) {
		if(!this._ready) {
			this.on('ready', cbk);
		} else {
			cbk();
		}
	};

	ContainerWidget.prototype.activate = function(settings) {
		settings.bindingContext.$widget = this;

		this._settings = settings;
		if(this._settings.tags) {
			this.tags = this._settings.tags;
		}
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

		if(this._settings.hasOwnProperty('expanded')) {
			if(ko.isObservable(this._settings.expanded)) {
				this.expanded = this._settings.expanded;
			} else {
				this.expanded(this._settings.expanded);
			}
		}

		if(this.scenarios() === null) {
			if(this.expanded() !== false) {
				return this._call(this._settings.type, this._settings.method);
			} else {
				// if initially collapsed then call when expanded first time
				var sub;
				sub = this.expanded.subscribe((function(){
					sub.dispose();
					this._call(this._settings.type, this._settings.method);
				}).bind(this));
			}
		}
		return true;
	};

	ContainerWidget.prototype.compositionComplete = function() {
		this._isLoading(false);
		this._ready = true;
		this.trigger('ready');
	};

	ContainerWidget.prototype.toggleExpand = function() {
		this.expanded(!this.expanded());
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

		if(this.tags) {
			var forEachTag = (function(tag){
				if(this.tags.indexOf(tag) === -1) {
					this.tags.push(tag);
				}
			}).bind(this);

			data.forEach((function(scenario){
				if(scenario.hasOwnProperty('tags')) {
					scenario.tags.forEach(forEachTag);
				}
			}).bind(this));

			this.tags.sort();
		}
		return true;
	};

	ContainerWidget.prototype._onError = function() {
		// do something
		this._isLoading(false);
	};

	ContainerWidget.prototype.onActivateScenario = function(scenario, scenarioWidget) {
		this._scenariosWidgets.push(scenarioWidget);
		scenario._widget = scenarioWidget;
		var forceNotify = this._scenariosWidgets.notifySubscribers.bind(this._scenariosWidgets);

		scenarioWidget.isLocallyHidden.subscribe(forceNotify);
		scenarioWidget.userStatus.subscribe(forceNotify);

		clearTimeout(this._stl);
		this._stl = setTimeout(this.compositionComplete.bind(this), 100);
	};

	ContainerWidget.prototype.showAllScenarios = function() {
		if(this.scenarios() !== null) {
			this.scenarios().forEach(function(scenario) {
				if(!!scenario._widget) {
					scenario._widget.filterIn();
				}
			});
		}
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
						scenario._widget.filterIn();
					}
					if(isOut) {
						scenario._widget.filterOut();
						// console.log('isOUT: hide');
					}
					if(!isIn && !isOut) {
						// is not present in any list
						scenario._widget.filterOut();
						// console.log('not filter?: hide');
					}

				} else {
					// console.log('NoTags: hide');
					scenario._widget.filterOut(); // if no tags, no shown
				}
				// console.groupEnd();
			}
		});
		// console.groupEnd()
	};

	return ContainerWidget;
});
