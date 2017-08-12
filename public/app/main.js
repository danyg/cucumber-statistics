(function(){

	'use strict';

	var BCDIR = '../bower_components';
	var VDIR = '../vendor';
	requirejs.config({
		baseUrl: '/app',
		paths: {
			durandal: BCDIR + '/Durandal/js',
			plugins: BCDIR + '/Durandal/js/plugins',
			transitions: BCDIR + '/Durandal/js/transitions',

			knockout: BCDIR + '/knockout.js/knockout.debug',
			jquery: BCDIR + '/jquery/jquery.min',

			text: BCDIR + '/requirejs-text/text',

			css: VDIR + '/require-css/css.min',

			toastr: VDIR + '/toastr/build/toastr.min',
			'knockout-sortable': VDIR + '/knockout-sortable/build/knockout-sortable.min'
		}
	});

	define([
		'lib/fixConsoleLogging',
		'lib/Promise',
		'durandal/system',
		'durandal/app',
		'durandal/viewLocator',

		'config/widgetConvention',

		'services/usersService',

		'bindings/bindings'
	], function(
		fixConsoleLogging,
		Promise,
		system,
		app,
		viewLocator,

		widgetConvention,

		usersService
	) {
		window.Promise = Promise;
		system.debug(true);
		fixConsoleLogging();
		app.title = 'Cucumber Statistics';


		app.configurePlugins({
		    router:true,
		    dialog: true,
		    widget: true
		});

		 app.start().then(function() {
		 	viewLocator.useConvention();
		 	widgetConvention();

		 	app.setRoot('modules/shell/shell');
		 });
	});

}());
