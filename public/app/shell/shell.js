define([
	'knockout',
	'plugins/router',
	'config/config',

	'contextMenu/contextMenu'
], function(
	ko,
	router,
	config,

	c
) {

	'use strict';

	function Shell() {
		this.router = router;
		this.isWorkareaHidden = ko.computed(function() {
			if(!router.activeInstruction()/* || router.isNavigating()*/) {
				return true;
			} else {
				return !!router.activeInstruction().config.home;
			}
		});

		// this.isWorkareaHidden = ko.observable(true);
	}

	Shell.prototype.activate = function() {

		this.router
			.map(config.routes)
			.buildNavigationModel()
		;

		return router.activate();
	};

	Shell.prototype.attached = function(view) {
		return;
		// var c = require('contextMenu/contextMenu');
		var layout = c.newLayout()
			.addItem('Option 1', function() {  console.log('TEXT!'); })
			.addItem('Option 2', function() {  console.log('TEXT 2!'); })
			.addItem('Really long label that could overflow the menu very bad', function() {  console.log('TEXT 2!'); })
			.addMenu('Really long label for a menu that could overflow the menu very bad')
				.addItem('Option 4.1', function() {  console.log('TEXT 4.1!'); })
				.addItem('Option 4.2', function() {  console.log('TEXT 4.2!'); })
			.getParent()
			.addMenu('Another submenu')
				.addItem('Option 5.1 yes a long option to destroy everything', function() {  console.log('TEXT 5.1!'); })
				.addItem('Option 5.2', function() {  console.log('TEXT 5.2!'); })
			.getParent()
		;

		c.bindToElement(view, layout);

	};

	return new Shell();
});