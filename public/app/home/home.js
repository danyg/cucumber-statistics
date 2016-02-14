define([
	'knockout',
	'plugins/http',
	'plugins/router',

	'contextMenu/contextMenu'
], function(
	ko,
	http,
	router,

	contextMenu
) {

	'use strict';

	function Home() {
		this.nightlies = ko.observableArray();
		this.errorMsg = ko.observable('');
		this.getData();
		this._router = router;
	}

	Home.prototype.getData = function() {
		this.errorMsg('');
		this.promise = http.get('/nightlies')
			.then(
				this._onData.bind(this),
				this._onFailure.bind(this)
			)
			.promise()
		;
	};

	Home.prototype.activate = function() {
		return this.promise;
	};

	Home.prototype.attached = function(view) {
		this._createContextMenu('body');
	};

	Home.prototype._onData = function(data) {
		this.nightlies(data);
	};

	Home.prototype._onFailure = function(/*jqXHR, status, responseText*/) {
		this.errorMsg('Not nightlies founded');
	};

	Home.prototype.isRouteActive = function(fragment) {
		return this._router.activeInstruction().fragment === fragment;
	};

	Home.prototype._createContextMenu = function(element) {
		var layout = contextMenu.newLayout();

		contextMenu.bindToElement(element, layout, this._onContextMenu.bind(this));
	};

	Home.prototype._onContextMenu = function(layout) {
		var me = this;
		layout.clearElements();

		layout.addItem('Last Executions', this._navigate.bind(this, 'lastExecution'));

		this.nightlies().forEach(function(name) {
			layout.addItem('Check ' + name, me._navigate.bind(me, 'nightly/' + name));

		});

		return layout;
	}

	Home.prototype._navigate = function(where) {
		this._router.navigate('#' + where);
	};


	return new Home();
});