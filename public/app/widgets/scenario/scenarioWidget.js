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
		this.file = ko.observable();
		this.fileRaw = ko.observable();
		this.sideValue = ko.observable();
		this.steps = ko.observableArray();
		this.results = ko.observableArray();
		this.tags = ko.observableArray();
		this.nightlyParent = ko.observable();

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
		this.isNew = ko.observable(false);

		this.nightlyId = ko.observable();

		this.cssClasses = ko.computed(function() {
			return (me.expanded() ? 'expanded ': '' + me.status()) + ' marked-as-' + me.userStatus() + (me.isNew() ? ' marked-as-new' : '');
		});

		this._isFixed = ko.computed(function() {
			return (
				me.userStatus() === 'auto-fix'
				|| me.userStatus() === 'fix'
			);
		});
		this.visible = ko.observable(true);
		this.hidden = ko.observable(false);
	}

	ScenarioWidget.prototype.activate = function(settings) {
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
		if(scenario.hasOwnProperty('file')) {
			var file = scenario.file.split(':');
			var line = file.splice(-1)[0];
			this.file(file.join(':') + ' @ line ' + line);
			this.fileRaw(scenario.file);
		}
		this.tags(scenario.tags || []);
		if(scenario.hasOwnProperty('_parent')) {
			this.nightlyParent(scenario._parent.name);
		}

		if(!!scenario.userStatus) {
			this.userStatus(scenario.userStatus);
		} else {
			this.userStatus('none');
		}

		if(!!scenario.results) {
			this.isNew(scenario.results[scenario.results.length-1].status === 'failed' && scenario.results[scenario.results.length-2].status === 'passed');
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
			'unknown'
		);

		if(!!this._settings.onActivate) {
			this._settings.onActivate(this);
		}

		this.visible = ko.computed((function() {
			var v = this.hidePassed() && this.status() === 'passed' ? false : true;
			if(v) {
				v = this._isFixed() ? this.showFixed() : true;
			}
			v = v && !this.hidden();
			return v;
		}).bind(this));

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

	/**
	 * Will mark it to be shown, but other features might make it hidden,
	 * check how the computable visible works
	 * @see  ScenarioWidget.visible
	 *
	 * @return void
	 */
	ScenarioWidget.prototype.show = function() {
		this.hidden(false);
	}
	/**
	 * Will mark it to be hidden, this will override any other logic and it
	 * will be dissapear
	 * @see  ScenarioWidget.visible
	 *
	 * @return void
	 */
	ScenarioWidget.prototype.hide = function() {
		this.hidden(true);
	}

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
		} else {
			return false;
		}
		layout.addItem('Copy Title to Clipboard', this._clipboard.bind(this, this.name()));
		if(!!this.fileRaw()) {
			layout.addItem('Copy file path to Clipboard', this._clipboard.bind(this, this.fileRaw()));
		}

		return layout;
	};

	var textarea;
	ScenarioWidget.prototype._clipboard = function(text) {
		if(!textarea) {
			textarea = document.createElement('textarea');
			textarea.style.zIndex = '10000';
			textarea.style.top = '0';
			textarea.style.left = '0';
			textarea.style.width = '500px';
			textarea.style.height = '30px';
			textarea.style.position = 'absolute';
			document.body.appendChild(textarea);
		}
		textarea.style.display = 'initial';
		textarea.value = text;
		textarea.select();

		try {
			var successful = document.execCommand('copy');
			var msg = successful ? 'successful' : 'unsuccessful';
			// console.log('Copying text command was ' + msg);
		} catch (err) {
			console.error('Oops, unable to copy', text);
		}

		textarea.style.display = 'none';
	};

	return ScenarioWidget;
});
