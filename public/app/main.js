(function(){

	'use strict';

	var BCDIR = '../bower_components';
	requirejs.config({
		baseUrl: '/app',
		paths: {
			durandal: BCDIR + '/Durandal/js',
			plugins: BCDIR + '/Durandal/js/plugins',
			transitions: BCDIR + '/Durandal/js/transitions',

			knockout: BCDIR + '/knockout.js/knockout.debug',
			jquery: BCDIR + '/jquery/jquery.min',

			text: BCDIR + '/requirejs-text/text'
		}
	});

	define([
		'durandal/system',
		'durandal/app',
		'durandal/viewLocator',

		'config/widgetConvention'
	], function(
		system,
		app,
		viewLocator,

		widgetConvention
	) {
		app.title = 'Cucumber Statistics';

		system.debug(false);

		app.configurePlugins({
		    router:true,
		    dialog: true,
		    widget: true
		});

		 app.start().then(function() {
		 	viewLocator.useConvention();
		 	widgetConvention();

		 	app.setRoot('shell/shell');
		 });
	});

}());
