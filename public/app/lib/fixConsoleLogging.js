define(['durandal/system'],function(system) {
	'use strict';

	var console = window.console;


	var proccessors = [
		function(args){
			if(!!args[0] && args[0].toString().indexOf('Unable to process binding') !== -1) {
				console.error.apply(window.console, args);
				return true;
			}
			if(!!args[0] && args[0].toString().indexOf('ERROR:') !== -1) {
				console.error.apply(window.console, args);
				return true;
			}
			return false;
		}
	];



	return function fixConsoleLogging(){
		if(system.debug()) {
			var oldLog = system.log;
			system.log = function(){
				var args = Array.prototype.slice.call(arguments, 0), res;

				for(var i = 0; i < proccessors.length; i++){
					try{
						res = proccessors[i](args);
						if(res){
							break;
						}
					} catch (e){}
				}

				if(!res){
					oldLog.apply(system, arguments);
				}
			};
		}
	};
});