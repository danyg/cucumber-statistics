define([
	'lib/User',
	'services/realtimeService',

	'knockout'
], function(
	User,
	realtimeService,

	ko
){
	'use strict';

	function rand(l,h) {
		return Math.floor(Math.random() * h) + l;
	};

	function createMyUser(CID) {
		var name = localStorage.getItem('user.name') ?
			localStorage.getItem('user.name') :
			'unknown'
		;
		var color = localStorage.getItem('user.color') ?
			localStorage.getItem('user.color') :
			User.COLORS[ rand(0, User.COLORS.length-1) ]
		;

		var user = new User(
			CID,
			name,
			color
		);

		user.on('name:changed', function(newName, oldName) {
			localStorage.setItem('user.name', newName);
			realtimeService.broadcast('user-name-changed', {
				CID: user.getCID(),
				newName: newName,
				oldName: oldName
			});
		});

		user.on('color:changed', function(newColor, oldColor) {
			localStorage.setItem('user.color', newColor);
			realtimeService.broadcast('user-color-changed', {
				CID: user.getCID(),
				newColor: newColor,
				oldColor: oldColor
			});
		});

		return user;
	}

	var users = {
		_users: [],
		_userByCID: {},
		_usersByName: {},
		COLORS: User.COLORS,

		me: ko.observable(),

		getUserByCID: function(CID) {
			if(this._userByCID.hasOwnProperty(CID)) {
				return this._userByCID[CID];
			}
		},

		getUsersByName: function(name) {
			if(this._usersByName.hasOwnProperty(name)) {
				return this._usersByName[name];
			} else {
				return this._usersByName[name] = [];
			}
		}

	};
	users.getMe = users.me;

	function addUser(user) {
		users._users.push(user);
		users._userByCID[user.getCID()] = user;
		users.getUsersByName(user.getName()).push(user);
	}

	function removeUser(CID) {
		var user = users.getUserByCID(CID);
		if(user) {
			delete users._userByCID[CID];
			var usersByName = users.getUsersByName(user.getName())
			usersByName.splice(usersByName.indexOf(user),1);
			users._users.splice(users._users.indexOf(user),1);
		}
	};

	realtimeService.on('WELCOME', function(data){
		users.me(createMyUser(data.CID));

		data.clients.forEach(function(CID){
			setTimeout(function(){
				realtimeService.talkTo(
					CID,
					'whoAreYou',
					users.getMe()
				);
			}, rand(100, 500));
		});

	});

	realtimeService.on('whoAreYou', function(data, fromCID) {
		addUser(new User(data));
		realtimeService.talkTo(fromCID, 'iAm', users.getMe());
	});

	realtimeService.on('iAm', function(data, from) {
		addUser(new User(data));
	});

	realtimeService.on('byebye', function(data) {
		removeUser(data.CID);
	});

	return users;
});