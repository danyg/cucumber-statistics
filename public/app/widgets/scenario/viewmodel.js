define([
	'knockout',
	'jquery'
], function(
	ko,
	$
) {

	'use strict';

	function ScenarioWidget() {
		var me = this;
		this.id = ko.observable();
		this.name = ko.observable();
		this.sideValue = ko.observable();
		this.steps = ko.observableArray();
		this.results = ko.observableArray();

		this.stability = ko.observable();
		this.stabilityLabel = ko.observable();
		this.timeAvg = ko.observable();

		this.scenario = ko.observable();

		this._isLoading = ko.observable(false);
		this.expanded = ko.observable(false);
		this.status = ko.observable('');

		this.cssClasses = ko.computed(function() {
			return me.expanded() ? 'expanded ': '' + me.status();
		});
	}

	ScenarioWidget.prototype.activate = function(settings) {
		settings.bindingContext.$widget = this;

		this._settings = settings;
		var scenario = this._settings.scenario;
		this.scenario(scenario);

		this.id(scenario._id);
		this.name(scenario.name);
		var results = scenario.results.sort(function(a,b){
			return parseInt(a.buildId, 10) < parseInt(b.buildId, 10);
		});
		this.status(results[0].status);

		this.sideValue(
			this._settings.sideValue === 'getMostTimeConsuming' ? 'time' :
				this._settings.sideValue === 'getMostUnstables' ? 'stability' :
				''
			);

		this.results(scenario.results);

		this.stability(this._formatStability(scenario.stability));
		this.stabilityLabel('Stability: ' + this.stability());

		this.timeAvg(!!scenario.timeAvg ?
			this._formatTime(scenario.timeAvg) :
			null
		);

		return true;
	};

	ScenarioWidget.prototype.attached = function(view) {
		this.$element = $(view);
	};

	ScenarioWidget.prototype.toggleExpand = function() {
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

	ScenarioWidget.prototype._formatStability = function(stability) {
		stability = parseFloat(stability) * 100.0;
		return (stability).toFixed(2) + '%';
	};

	ScenarioWidget.prototype._formatTime = function(time) {
		time = parseFloat(time) / 1000000000.0;
		return time.toFixed(3) + 's';
	};

	return ScenarioWidget;
});