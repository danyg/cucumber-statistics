define([
	'knockout',
	'jquery',

	'plugins/http',
	'nightly/nightly',

	'contextMenu/contextMenu'
], function(
	ko,
	$,

	http,
	nightlyController,

	contextMenu
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
		this.showFixed = ko.observable(false);
		this.hidePassed = ko.observable(false);

		this._isLoading = ko.observable(false);
		this.expanded = ko.observable(false);
		this.status = ko.observable('');
		this.userStatus = ko.observable('');

		this.nightlyId = ko.observable();

		this.cssClasses = ko.computed(function() {
			return (me.expanded() ? 'expanded ': '' + me.status()) + ' marked-as-' + me.userStatus();
		});

		this._isFixed = ko.computed(function() {
			return (
				me.userStatus() === 'auto-fix'
				|| me.userStatus() === 'fix'
			);
		});
		this.visible = ko.observable(true);


	}

	ScenarioWidget.prototype.activate = function(settings) {
		var me = this;
		settings.bindingContext.$widget = this;

		this._settings = settings;
		var scenario = this._settings.scenario;
		this.scenario(scenario);

		if(!!this._settings.showFixed) {
			this.showFixed = this._settings.showFixed;
		}
		if(!!this._settings.hidePassed) {
			this.hidePassed = this._settings.hidePassed;
		}

		this.id(scenario._id);
		this.name(scenario.name);

		if(!!scenario.userStatus) {
			this.userStatus(scenario.userStatus);
		} else {
			this.userStatus('none');
		}

		this.nightlyId(!!this._settings.nightlyId ?
			this._settings.nightlyId :
			nightlyController.nightlyId()
		);

		this.status(scenario.lastStatus);

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

		if(!!this._settings.onActivate) {
			this._settings.onActivate(this);
		}

		this.visible = ko.computed(function() {
			var v = me.hidePassed() && me.status() === 'passed' ? false : true;
			if(v) {
				v = me._isFixed() ? me.showFixed() : true;
			}
			return v;
		});

		return true;
	};

	ScenarioWidget.prototype.attached = function(view) {
		this.$element = $(view);
		this._createContextMenu(view);
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

	ScenarioWidget.prototype.markAsFixed = function() {
		this._markAs('fix');
	};

	ScenarioWidget.prototype.markAsNone = function() {
		this._markAs('none');
	};

	ScenarioWidget.prototype._markAs = function(userStatus) {
		if(this.expanded()){
			this.toggleExpand();
		}
		this.userStatus(userStatus);

		http.post('/results/' + this.nightlyId() + '/scenarios/updateUserStatus/' + this.id(), {
			'userStatus': userStatus
		});
	};

	ScenarioWidget.prototype._createContextMenu = function(element) {
		var layout = contextMenu.newLayout();

		contextMenu.bindToElement(element, layout, this._onContextMenu.bind(this));
	};

	ScenarioWidget.prototype._onContextMenu = function(layout) {

		layout.clearElements();

		if(this.status() !== 'passed') {

			if(!this._isFixed()) {
				layout.addItem('Mark as fixed', this.markAsFixed.bind(this));
			} else {
				layout.addItem('Mark as not fixed yet', this.markAsNone.bind(this));
			}
		}

		return layout;
	}

	return ScenarioWidget;
});