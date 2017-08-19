(function(){

	'use strict';

	var VDIR = '../vendor';
	requirejs.config({
		baseUrl: '/app',
		paths: {
			durandal: VDIR + '/durandal/js',
			plugins: VDIR + '/durandal/js/plugins',
			transitions: VDIR + '/durandal/js/transitions',

			jquery: VDIR + '/jquery/dist/jquery.min',

			text: VDIR + '/requirejs-text/text',

			knockout: VDIR + '/knockout/build/output/knockout-latest',
			// knockout: VDIR + '/knockout/build/output/knockout-latest.debug',
			css: VDIR + '/require-css/css.min',

			toastr: VDIR + '/toastr/build/toastr.min',
			'knockout-sortablejs': VDIR + '/knockout-sortablejs/knockout-sortable',
			'Sortable': VDIR + '/sortablejs/Sortable.min'
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
