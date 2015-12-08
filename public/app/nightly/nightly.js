define([
	'knockout'
], function(
	ko
) {

	'use strict';

	function Nightly() {
		this.nightlyId = ko.observable();
	}

	Nightly.prototype.activate = function(nightlyId) {
		this.nightlyId(nightlyId);
		console.log('Nightly REACTIVATED', nightlyId);
		return true;
	};

	return new Nightly();
});