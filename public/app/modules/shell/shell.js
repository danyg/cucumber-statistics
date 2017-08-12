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

	realtimeService,
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
		this.isAppBlocked = ko.observable(false);

		realtimeService.on('DISCONNECTED', this._onRTOff.bind(this))
		realtimeService.on('CONNECTED', this._onRTOn.bind(this))
	}

	Shell.prototype.activate = function() {

		this.router
			.map(config.routes)
			.buildNavigationModel()
		;

		return router.activate();
	};

	Shell.prototype.attached = function(view) {
		realtimeService.connect();
	};

	Shell.prototype._onRTOn = function() {
		clearInterval(this._rtOffInt);
		this.isAppBlocked(false);
		if(this._warnElm) {
			this._disconnectedAt = null;
			toastr.clear(this._warnElm);
			delete this._warnElm;
		}
	};

	Shell.prototype._onRTOff = function() {
		this.isAppBlocked(true);
		if(!this._disconnectedAt) {
			this._disconnectedAt = new Date();
		}
		var getWarnMsg = (function () {
			return 'Cannot reach server<br/>'
				+ 'Disconnected ' + utils.calculateDateDiff(Date.now(), this._disconnectedAt) + '<br/>'
				+ 'Reconnection in ' + utils.calculateDateDiff((parseInt(Date.now()/1000,10)*1000), realtimeService.getNextReconnectionTime())
		}).bind(this);

		this._warnElm = toastr.warning(
			getWarnMsg(),
			null,
			{
				timeOut: 0,
				closeButton: true,
				closeOnHover: false,
				hideDuration: 500,
				onHidden: (function(){
					realtimeService.connect();
					this._onRTOff();
				}).bind(this)
			}
		);
		this._rtOffInt = setInterval((function(){
			$('.toast-message', this._warnElm).html(getWarnMsg());
		}).bind(this), 1000);
	};

	return new Shell();
});