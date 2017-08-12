define([
	'knockout',
	'jquery',

	'config/dictionary',

	'plugins/http',
	'modules/nightly/nightly',

	'modules/contextMenu/contextMenu',
	'durandal/events',
	'services/realtimeService',
	'services/usersService'
], function(
	ko,
	$,

	dictionary,

	http,
	nightlyController,

	contextMenu,
	Events,
	realtimeService,
	usersService
) {

	'use strict';

	var scenariosComms = {};
	Events.includeIn(scenariosComms);

	var RECENTLY_COLLAPSED = 'recently-collapsed';

	function ScenarioWidget() {
		var me = this;
		this.dictionary = dictionary;
		this._subscriptions = [];

		this.id = ko.observable();
		this.name = ko.observable();
		this.file = ko.observable();
		this.fileRaw = ko.observable();
		this.sideValue = ko.observable();
		this.steps = ko.observableArray();
		this.results = ko.observableArray();
		this.tags = ko.observableArray();
		this.nightlyId = ko.observable();
		this.UID = ko.computed((function(){
			return this.nightlyId() + '_' + this.id();
		}).bind(this));

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


		this.isLocallyHidden = ko.observable(false);
		this.isFiltered = ko.observable(false);
		this.modificators = ko.observableArray();
		this.users = ko.observableArray();
		this.extraKlasses = ko.observableArray();

		this.cssClasses = ko.computed((function() {
			var klasses = [
				(this.expanded() ? 'expanded': this.status()),
				('marked-as-' + this.userStatus()),
				(this.isLocallyHidden() ? 'is-locally-hidden' : '')
			];
			return klasses.join(' ') + ' ' + this.extraKlasses().join(' ');
		}).bind(this));

		this._subscriptions.push(
			scenariosComms.on('collapsed', this._onSiblingScnCollapsed.bind(this))
		);

		this._isFixed = ko.computed((function() {
			return (
				this.userStatus() === 'auto-fix'
				|| this.userStatus() === 'fix'
			);
		}).bind(this));

		// to be used in container to list the amount of hidden elements
		this.isInHiddenStatus = ko.computed((function() {
			return this._isFixed() || this.isLocallyHidden();
		}).bind(this));

		var lastVisibleState = null;
		var isVisible = (function(){
			if(this.isInHiddenStatus()) {
				if(this.showHidden()) {
					return true;
				}
				return false;
			}

			if(this.status() === 'passed') {
				if(this.hidePassed()) {
					return false;
				}
				return true;
			}

			if(this.isFiltered()) {
				return false;
			}

			return true;
		}).bind(this);
		this.visible = ko.computed((function() {
			var forceSubscription = this.isFiltered() || this._isFixed() || this.isInHiddenStatus() || this.isLocallyHidden() || this.status() || this.hidePassed() || this.showHidden();
			var visible = isVisible();

			if(lastVisibleState === true && visible === false) {
				if(this.expanded()) {
					this.toggleExpand();
				}
			}

			lastVisibleState = visible;

			return visible;
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
			this.nightlyId(scenario._parent.name);
		} else {
			this.nightlyId(!!this._settings.nightlyId ?
				this._settings.nightlyId :
				nightlyController.nightlyId()
			);
		}

		if(!!scenario.userStatus) {
			this.userStatus(scenario.userStatus);
		} else {
			this.userStatus('none');
		}

		if(!!scenario.results) {
			if(scenario.results.length > 1) {
				if(
					scenario.results[scenario.results.length-1].status === 'failed'
					&& scenario.results[scenario.results.length-2].status === 'passed'
				) {
					this.modificators.push('new');
				}

			} else {
				this.modificators.push('new');
			}
		}
		if(this.userStatus().indexOf('recidivist') !== -1) {
			this.modificators.push(this.userStatus());
		}




		this.status(scenario.lastStatus);

		this.sideValue(
			this._settings.sideValue === 'getMostTimeConsuming' ? 'time' :
				this._settings.sideValue === 'getMostUnstables' ? 'stability' :
				''
			);

		this.results(scenario.results);

		this.stability(this._formatStability(scenario.stability));
		this.stabilityLabel(this.stability());

		this.timeAvg(!!scenario.timeAvg ?
			this._formatTime(scenario.timeAvg) :
			'unknown'
		);

		if(!!this._settings.onActivate) {
			this._settings.onActivate(this);
		}

		this._subscribeExternals();

		return true;
	};

	ScenarioWidget.prototype.attached = function(view) {
		this.$element = $(view);
		this._createContextMenu(view);
	};

	ScenarioWidget.prototype.toggleExpand = function() {
		var pre = this.expanded();
		this.expanded(!this.expanded());

		if(pre && !this.expanded()) {
			// expanded -> collapsed
			this.extraKlasses.push(RECENTLY_COLLAPSED);
			scenariosComms.trigger('collapsed', this);
			this._removeUser(usersService.getMe().getCID());
			realtimeService.broadcast(
				'user-collapses-' + this.UID(),
				usersService.getMe()
			);

		} else if(!pre && this.expanded()) {
			// collapsed - > expanded
			this._removeRecentlyCollapsed();
			this._addUser(usersService.getMe().toJSON());
			realtimeService.broadcast(
				'user-expanses-' + this.UID(),
				usersService.getMe()
			);
		}

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

	ScenarioWidget.prototype.filterIn = function() {
		this.isFiltered(false);
	}

	ScenarioWidget.prototype.filterOut = function() {
		this.isFiltered(true);
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
	};

	ScenarioWidget.prototype.markAsNone = function() {
		this._markAs('none');
	};

	ScenarioWidget.prototype._markAs = function(userStatus, external) {
		this.userStatus(userStatus);

		if(external !== true) {
			http.post('/results/' + this.nightlyId() + '/scenarios/updateUserStatus/' + this.id(), {
				'userStatus': userStatus
			});
			realtimeService.broadcast(
				'mark-scenario-' + this.UID(),
				{userStatus: userStatus}
			);
		}
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

	ScenarioWidget.prototype._onSiblingScnCollapsed = function(scn){
		if(scn !== this) {
			this._removeRecentlyCollapsed();
		}
	};

	ScenarioWidget.prototype._removeRecentlyCollapsed = function(){
		var pos = this.extraKlasses().indexOf(RECENTLY_COLLAPSED);
		if(pos >= 0) {
			this.extraKlasses.splice(pos,1);
		}
	};

	ScenarioWidget.prototype._subscribeExternals = function() {
		this._subscriptions.push(
			realtimeService.on('mark-scenario-' + this.UID(), (function(data) {
				this._markAs(data.userStatus, true);
			}).bind(this))
		);
		this._subscriptions.push(
			realtimeService.on('user-expanses-' + this.UID(), (function(user) {

				this._addUser(user);

			}).bind(this))
		);
		this._subscriptions.push(
			realtimeService.on('user-collapses-' + this.UID(), (function(user) {
				this._removeUser(user.CID);
			}).bind(this))
		);
		this._subscriptions.push(
			realtimeService.on('byebye', (function(data) {
				this._removeUser(data.CID);
			}).bind(this))
		);

		var answerTo = {};
		this._subscriptions.push(
			realtimeService.on('scenario-data-for-' + this.UID(), (function(data, fromCID) {

				// prevent to answer twice when sibling is rendering this twice
				if(!answerTo.hasOwnProperty(fromCID)) {
					if(this.expanded()) {
						answerTo[fromCID] = true;
						setTimeout((function(){
							realtimeService.talkTo(
								fromCID,
								'user-expanses-' + this.UID(),
								usersService.getMe()
							);
							delete answerTo[fromCID]
						}).bind(this), 500);
					}

				}
			}).bind(this))
		);
		realtimeService.broadcast('scenario-data-for-' + this.UID());
	};

	ScenarioWidget.prototype._getIxUserByCID = function(CID) {
		var ix;
		this.users().forEach(function(u, i){
			ix = (u.CID.indexOf(CID) !== -1) ? i : -1;
		});
		return ix;
	};

	ScenarioWidget.prototype._getIxUserByName = function(name) {
		var ix;
		this.users().forEach(function(u, i){
			ix = (u.name === name) ? i : -1;
		});
		return ix;
	};

	ScenarioWidget.prototype._addUser = function(user) {
		var ix = this._getIxUserByName(user.name);
		if(ix > -1) {
			var u = this.users()[ix];
			u.CID.push(user.CID);
			u.m++;
			u.label(u.alias + ' x'+u.m);
		} else {
			var alias = (usersService.getMe().getName() === user.name) ?
				'You' :
				user.name
			;
			this.users.push({
				CID: [user.CID],
				label: ko.observable(alias),
				alias: alias,
				name: user.name,
				color: user.color,
				m:1
			});
		}
	};

	ScenarioWidget.prototype._removeUser = function(CID) {
		var ix = this._getIxUserByCID(CID);

		if(ix > -1) {
			var u = this.users()[ix];
			if(u.m > 1) {
				u.m--;
				if(u.m > 1) {
					u.label(u.alias + ' x'+u.m);
				} else {
					u.label(u.alias);
				}
			} else {
				this.users.splice(ix, 1);
			}
		}
	};

	ScenarioWidget.prototype.detached = function() {
		if(this.expanded()) {
			realtimeService.broadcast(
				'user-collapses-' + this.UID(),
				usersService.getMe()
			);
		}
		this._subscriptions.forEach((function(sub){
			if(sub.dispose) {
				sub.dispose();
			}
			if(sub.off) {
				sub.off();
			}
		}).bind(this))
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
