define([
	'knockout'
], function(
	ko
){

	'use strict';

	function Layout(parent) {
		this.items = {};
		this._parent = parent;
	};

	Layout.prototype.addItem = function(label, cbk) {
		this.items[label] = cbk;

		return this;
	};

	Layout.prototype.addMenu = function(label) {
		this.items[label] = new Layout(this);

		return this.items[label];
	};

	Layout.prototype.getParent = function() {
		return this._parent;
	};

	function ContextMenu() {
		this.layout = ko.observable();
		this.visible = ko.observable(false);
	};

	ContextMenu.prototype.newLayout = function() {
		return new Layout();
	};

	ContextMenu.prototype.render = function(layout) {
		if(layout instanceof Layout) {
			this.layout(layout);
			this.visible(false);
		} else {
			throw new Error('the passed layout is not a Layout children, use .newLayout() method');
		}
	};

	ContextMenu.prototype.open = function(mouseEvent) {
		// target is not closer!
		// everybody else is closer! and first click must be prevented to pop down
	};

	return new ContextMenu();
});