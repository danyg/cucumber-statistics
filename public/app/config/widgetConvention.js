define([
	'plugins/widget'
],
function(
	widget
){
	'use strict';

	function getParts(kind, type) {
		var parts = {
			container: '',
			subpath: ''
		};
		var tmp = kind.split('/');
		parts.container = tmp.splice(0,1);
		var widgetName = tmp.splice(-1,1);
		parts.subpath = tmp.join('/') + widgetName + '/' + widgetName + type;
		return parts;
	}

	function getPath(kind, type) {
		if(kind.indexOf('/') === -1) {
			return 'widgets/' + kind + '/' + kind + type;
		} else {
			var parts = getParts(kind, type);
			return parts.container + '/widgets/' + parts.subpath;
		}
	}

	function useConvention(){
		widget.convertKindToModulePath = function(kind){
			return getPath(kind, 'Widget');
		};
		widget.convertKindToViewPath = function(kind){
			return getPath(kind, 'View');
		};
	}

	return useConvention;
});