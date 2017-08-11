define([
	'knockout',
	'jquery',
	'plugins/router',
	'config/config',

	'services/realtimeService',
	'lib/utils',
	'toastr',
	'css!toastr'
], function(
	ko,
	$,
	router,
	config,

	realtime,
	utils,
	toastr
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

		this._rtOff = false;
		realtime.on('DISCONNECTED', this._onRTOff.bind(this))
		realtime.on('CONNECTED', this._onRTOn.bind(this))
	}

	Shell.prototype.activate = function() {

		this.router
			.map(config.routes)
			.buildNavigationModel()
		;

		return router.activate();
	};

	Shell.prototype.attached = function(view) {
	};

	Shell.prototype._onRTOn = function() {
		clearInterval(this._rtOffInt);
		if(this._warnElm) {
			toastr.clear(this._warnElm);
			delete this._warnElm;
		}
	};

	Shell.prototype._onRTOff = function() {
		this._rtOff = true;
		var disconnectedAt = new Date();
		function getWarnMsg() {
			return 'Cannot reach server<br/>'
				+ 'Disconnected ' + utils.calculateDateDiff(Date.now(), disconnectedAt) + '<br/>'
				+ 'Reconnection in ' + utils.calculateDateDiff((parseInt(Date.now()/1000,10)*1000), realtime.getNextReconnectionTime())
		};

		this._warnElm = toastr.warning(
			getWarnMsg(),
			null,
			{timeOut: 0}
		);
		this._rtOffInt = setInterval((function(){
			$('.toast-message', this._warnElm).html(getWarnMsg());
		}).bind(this), 1000);
	};

	return new Shell();
});