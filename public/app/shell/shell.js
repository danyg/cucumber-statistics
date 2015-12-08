define([
	'knockout',
	'plugins/router',
	'config/config'
], function(
	ko,
	router,
	config
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

	return new Shell();
});