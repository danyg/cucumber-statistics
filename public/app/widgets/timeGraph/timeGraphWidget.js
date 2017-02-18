/*
* @Author: Daniel Goberitz
* @Date:   2017-02-18 13:28:12
* @Last Modified by:   dalgo
* @Last Modified time: 2017-02-18 14:14:38
*/
define([
	'knockout'
], function(
	ko
) {

	'use strict';

	var DoW = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

	function fZ(n) {
		return ('00' + n.toString()).slice(-2);
	}

	function TimeGraph() {
		this.results = ko.observableArray();
	}

	TimeGraph.prototype.activate = function(settings) {
		this.results(ko.unwrap(settings.results));
	};

	TimeGraph.prototype.attached = function(view) {
		view.scrollLeft = view.scrollWidth;
	};

	TimeGraph.prototype._parseDate = function(timestamp) {
		if(timestamp === undefined) {
			return '';
		}
		var d = new Date(timestamp);
		return DoW[d.getDay()] + ', ' + fZ(d.getDate()) + '/' + fZ(d.getMonth()+1) + '/' + d.getFullYear() + ' ' + fZ(d.getHours()) + ':' + fZ(d.getMinutes());
	};

	return TimeGraph;

});
