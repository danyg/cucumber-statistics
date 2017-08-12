define([
	'durandal/events'
], function (
	Events
) {
	'use strict';

	var COLORS = [
		'red',
		'green',
		'blue',
		'coral',
		'lime',
		'cyan',
		'gold',
		'violet',
		'indigo'
	];

	function User(jsonOrCID, name, color) {
		var json = jsonOrCID;
		var CID = jsonOrCID;
		if(json.CID >= 0 && json.name && json.color) {
			CID = json.CID;
			name = json.name;
			color = json.color;
		}

		this.setCID(CID)
			.setName(name)
			.setColor(color)
		;
	};
	User.__defineGetter__('COLORS', function(){
		return COLORS;
	});
	User.__defineSetter__('COLORS', function(){
		throw new Error('COLORS is readonly');
	});

	Events.includeIn(User.prototype);

	User.prototype.setCID = function(CID){
		this._CID = CID;
		return this;
	};

	User.prototype.setName = function(name){
		var oldName = this._name;
		this._name = name;
		this.trigger('name:changed', name, oldName);
		return this;
	};

	User.prototype.setColor = function(color){
		color = color.toLowerCase();
		if(COLORS.indexOf(color) === -1) {
			throw new TypeError('unrecognized color, valid colors: ' + COLORS.join(', '));
		}
		var oldColor = this._color;
		this._color = color;
		this.trigger('color:changed', color, oldColor);
		return this;
	};

	User.prototype.getCID = function(){
		return this._CID;
	};

	User.prototype.getName = function(){
		return this._name;
	};

	User.prototype.getColor = function(){
		return this._color;
	};

	User.prototype.toJSON = function(){
		return {
			CID: this._CID,
			name: this._name,
			color: this._color
		};
	}

	return User;
});