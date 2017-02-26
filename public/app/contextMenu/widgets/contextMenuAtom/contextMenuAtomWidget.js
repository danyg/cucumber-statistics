define([
	'knockout'
], function(
	ko
){

	'use strict';

	function ContextMenuAtomWidget() {
		var me = this;

		this.elements = ko.observable();
		this.top = ko.observable();
		this.left = ko.observable();
		this.right = ko.observable();
		this.bottom = ko.observable();
	}

	ContextMenuAtomWidget.prototype.activate = function(settings) {
		settings.bindingContext.$widget = this;

		this._settings = settings;
		this.elements = this._settings.layout;
		this.director = this._settings.director;
		this._setPositions();

		// console.log(this);
		if(!window.menus) {
			window.menus = [];
		}
		window.menus.push(this);
	};

	ContextMenuAtomWidget.prototype.clickElement = function(element, event) {
		if(!!element.click && typeof element.click === 'function') {
			this.director.close(event);
			try {
				element.click();
			} catch(e) {
				console.error('Error clicking in', element, e.message, e.stack);
			}
		}
	};

	ContextMenuAtomWidget.prototype._setPositions = function() {
		if(!!this._settings.top) {
			this.top = this._settings.top;
		}
		if(!!this._settings.left) {
			this.left = this._settings.left;
		}
		if(!!this._settings.right) {
			this.right = this._settings.right;
		}
		if(!!this._settings.bottom) {
			this.bottom = this._settings.bottom;
		}
	};

	return ContextMenuAtomWidget;

});