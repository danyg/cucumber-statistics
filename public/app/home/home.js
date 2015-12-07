define([], function() {

	'use strict';

	function Home() {
	}

	Home.prototype.activate = function() {
		return true;
	};

	return new Home();
});