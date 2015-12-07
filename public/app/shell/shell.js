define([
	'plugins/router',
	'config/config'
], function(router, config) {

	'use strict';

	function Shell() {
		this.router = router;
	}

	Shell.prototype.activate = function() {

		this.router
			.map(config.routes)
			.buildNavigationModel()
		;

		return router.activate();
	};

	return new Shell();
});