define([
	'knockout'
], function(
	ko
){

	'use strict';

	function Layout(label, parent) {
		this.label = label;
		this.items = [];
		this._parent = parent;

	}

	Layout.prototype.clearElements = function() {
		this.items = [];
		return this;
	};

	Layout.prototype.addItem = function(label, cbk) {
		this.items.push({
			label: label,
			click: cbk
		});

		return this;
	};

	Layout.prototype.addMenu = function(label) {
		var item = new Layout(label, this);
		this.items.push(item);

		return item;
	};

	Layout.prototype.getParent = function() {
		return this._parent;
	};

	function ContextMenu() {
		this.layout = ko.observable(this.newLayout());
		this.visible = ko.observable(false);
		this.top = ko.observable(0);
		this.left = ko.observable(0);
		this.right = ko.observable('inherit');
		this.bottom = ko.observable('inherit');
		this.rtl = ko.observable(false);
	}

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

	ContextMenu.prototype.attached = function(view) {
		var me = this;
		$('.context-menu-blockout', view).on('contextmenu', function(e){
			me.close(e);
			e.preventDefault();
			return false;
		});
	};

	ContextMenu.prototype.open = function(mouseEvent) {
		var x = mouseEvent.clientX;
		var y = mouseEvent.clientY;
		this.right('initial');
		this.bottom('initial');
		if(window.innerWidth-400 < x) {
			if(window.innerWidth-200 < x) {
				x = 'initial';
				this.right('5px');
			}
			this.rtl(true);
		} else {
			this.rtl(false);
		}

		if(window.innerHeight*.6 < y) {
			if(window.innerHeight*.8 < y) {
				y = 'initial';
				this.bottom('5px');
			}
		}

		this.left(typeof x === 'string' ? x : x + 'px');
		this.top(typeof y === 'string' ? y : y + 'px');
		this.visible(true);

		// target is not closer!
		// everybody else is closer! and first click must be prevented to pop down
	};

	ContextMenu.prototype.close = function() {
		this.visible(false);
	};

	ContextMenu.prototype.bindToElement = function(element, layout, cbk) {
		// console.log('CONTEXTMENU BINDED TO', element);
		var me = this;
		$(element).on('contextmenu', function(e) {
			if(!!cbk) {
				layout = cbk(layout);
			}
			if(layout === false) {
				return true;
			}
			me.render(layout);
			me.open(e);

			// console.log('CONTEXT MENU ACTIONED ON', this, e, e.target === this);

			e.preventDefault();
			return false;
		});
	};

	return new ContextMenu();
});