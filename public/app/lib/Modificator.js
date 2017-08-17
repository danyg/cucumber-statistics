define([
	'config/dictionary'
], function(
	dictionary
){
	'use strict';

	function Modificator(type) {
		this._type = type;
		this._text = '&nbsp;'
		this._overrideTitle = false;
	}

	Modificator.prototype.setText = function(t) {
		this._text = t;
		return this;
	};

	Modificator.prototype.setTitle = function(t) {
		this._overrideTitle = t;
		return this;
	};

	Modificator.prototype.getText = function() {
		return this._text;
	};

	Modificator.prototype.getType = function() {
		return this._type;
	};

	Modificator.prototype.getTitle = function() {
		if(this._overrideTitle !== false) {
			return this._overrideTitle;
		}
		var dKey = 'titleFor ' + this.getType();
		var title = '';
		if(dictionary.is(dKey)) {
			title = dictionary(dKey);
		} else {
			console.warn('missing \'' + dictionary.toId(dKey) + '\' dictionary translation');
		}

		return title;
	};

	return Modificator;
});