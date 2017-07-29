define(['knockout'], function(ko) {

	'use strict';
	function camelize(str) {
		return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
			return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
		}).replace(/\s+/g, '');
	}

	ko.bindingHandlers.testId = {
		update: function(element, valueAccessor) {
			var data = ko.unwrap(valueAccessor());
			var testId;
			if(typeof data === 'string') {
				testId = data;
			} else {
				data = data.map(function(item) {
					return camelize(item);
				});
				testId = data.join('_');
			}

			element.setAttribute('data-testid', testId);
		}
	};

	return ko.bindingHandlers.testId;

});