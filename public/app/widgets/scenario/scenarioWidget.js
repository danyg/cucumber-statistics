define([
	'knockout',
	'jquery',

	'plugins/http',
	'modules/nightly/nightly',

	'modules/contextMenu/contextMenu'
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
		this.showHidden = ko.observable(false);
		this.hidePassed = ko.observable(false);

		this._isLoading = ko.observable(false);
		this.expanded = ko.observable(false);
		this.status = ko.observable('');
		this.userStatus = ko.observable('');
		this.isNew = ko.observable(false);

		this.nightlyId = ko.observable();

		this.isLocallyHidden = ko.observable(false);
		this.hidden = ko.observable(false);

		this.isForcedToBeHidden = ko.observable(false);
		this.isForcedToBeShown = ko.observable(false);

		this.cssClasses = ko.computed((function() {
			var klasses = [
				(this.expanded() ? 'expanded': this.status()),
				('marked-as-' + this.userStatus()),
				(this.isNew() ? 'marked-as-new' : ''),
				(this.isLocallyHidden() ? 'is-locally-hidden' : '')
			];
			return klasses.join(' ');
		}).bind(this));

		this._isFixed = ko.computed(function() {
			return (
				me.userStatus() === 'auto-fix'
				|| me.userStatus() === 'fix'
			);
		});

		this.visible = ko.computed((function() {
			var forceSubscription = this.isForcedToBeHidden() || this.isForcedToBeShown || this.hidden() || this._isFixed() || this.isLocallyHidden() || this.status() || this.hidePassed() || this.showHidden();

			if(this.isForcedToBeShown()) {
				return true;
			}
			if(this.isForcedToBeHidden()) {
				return false;
			}

			if(this.status() === 'passed') {
				if(this.hidePassed()) {
					return false;
				}
				return true;
			}

			if(this._isFixed() || this.isLocallyHidden()) {
				if(this.showHidden()) {
					return true;
				}
				return false;
			}

			return true;
		}).bind(this));

		// to be used in container to list the amount of hidden elements
		this.isInHiddenStatus = ko.computed((function() {
			return this._isFixed() || this.isLocallyHidden();
		}).bind(this));
	}

	ScenarioWidget.prototype.activate = function(settings) {
		settings.bindingContext.$widget = this;

		this._settings = settings;
		var scenario = this._settings.scenario;
		this.scenario(scenario);

		if(!!this._settings.showHidden) {
			this.showHidden = this._settings.showHidden;
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

		if(scenario.hasOwnProperty('_parent')) {
			this.nightlyId(scenario._parent.name);
		} else {
			this.nightlyId(!!this._settings.nightlyId ?
				this._settings.nightlyId :
				nightlyController.nightlyId()
			);
		}


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
		this.isForcedToBeHidden(false);
		this.isForcedToBeShown(true);
	}
	/**
	 * Will mark it to be hidden, this will override any other logic and it
	 * will be dissapear
	 * @see  ScenarioWidget.visible
	 *
	 * @return void
	 */
	ScenarioWidget.prototype.hide = function() {
		this.isForcedToBeShown(false);
		this.isForcedToBeHidden(true);
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

	ScenarioWidget.prototype.toggleHide = function() {
		this.isLocallyHidden(!this.isLocallyHidden());

		if(this.expanded() && this.isLocallyHidden()){
			this.toggleExpand();
		}
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
