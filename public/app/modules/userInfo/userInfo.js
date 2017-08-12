define([
	'knockout',

	'services/usersService',
	'services/realtimeService',
	'lib/utils'
], function (
	ko,

	usersService,
	realtimeService,

	utils
) {
	'use strict';

	var COOLDOWN_TIME = 300;

	function UserInfo() {
		this.connectionStatus = ko.observable(realtimeService.status);
		this.username = ko.observable('');
		this.currentColor = ko.observable('');
		this.colorsExpanded = ko.observable(false);
		this.colors = usersService.COLORS;
		this.me = usersService.me;

		realtimeService.on('DISCONNECTED', this._updateCStatus.bind(this))
		realtimeService.on('CONNECTED', this._updateCStatus.bind(this))

		if(this.me()) {
			this._userSet();
		} else {
			this.me.subscribe(this._userSet.bind(this));
		}
	}

	UserInfo.prototype.updateConnectionStatistics = function(_, e) {
		if(e.currentTarget) {
			e.currentTarget.title = 'Realtime connection:\n' +
				'Transfered: ' + utils.bytes(realtimeService.bytesSent + realtimeService.bytesReceived) + '\n' +
				'Uploaded: ' + utils.bytes(realtimeService.bytesSent) + '\n' +
				'Downloaded: ' + utils.bytes(realtimeService.bytesReceived)
			;
		}
	}

	UserInfo.prototype._updateCStatus = function() {
		this.connectionStatus(realtimeService.status);
	};

	UserInfo.prototype._userSet = function() {
		this.username(this.me().getName());
		this.currentColor(this.me().getColor());

		this.username.subscribe(this.updateUserName.bind(this));
	};

	UserInfo.prototype.getClassForColor = function(color) {
		var className = color;
		if(this.currentColor() === color) {
			className += ' selected';
		}
		return className;
	};

	var setColorTO;
	UserInfo.prototype.selectColor = function(color) {
		this.currentColor(color);
		clearTimeout(setColorTO);
		setColorTO = setTimeout(function(){ // prevent flood the pipe
			usersService.getMe().setColor(color);
		}, COOLDOWN_TIME);
	};

	var setNameTO;
	UserInfo.prototype.updateUserName = function() {
		var name = this.username();

		// set name is called in every keyup, the idea is to update the name
		// when the user finishes to write, but not force them to click outside
		// the input.
		clearTimeout(setNameTO);
		setNameTO = setTimeout(function(){ // prevent flood the pipe
			usersService.getMe().setName(name);
		}, COOLDOWN_TIME);
	};

	UserInfo.prototype.toggleColorExpanded = function() {
		this.colorsExpanded(!this.colorsExpanded());
	};

	return new UserInfo();
});