(function() {

	'use strict';
	function camelize(str, firstUpper) {
		return str
			.replace(/\W/g,' ')
			.replace(/\s\s/g,' ')
			.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
				return index == 0 ? letter[firstUpper ? 'toUpperCase' : 'toLowerCase']() : letter.toUpperCase();
			})
			.replace(/\s+/g, '')
		;
	}

	function toTestId(data) {
		var testId;
		if(typeof data === 'string') {
			testId = camelize(data);
		} else {
			data = data.map(function(item) {
				return camelize(item);
			});
			testId = data.join('_');
		}
		return testId;
	};

	var testId = {
		convertToTestId: camelize,
		toTestId: toTestId
	};

	var root;
	try{
		root = global;
	} catch(e) {
		root = window;
	}

	if(root.hasOwnProperty('define')) {
		root.define(['knockout'], function(ko) {
			ko.bindingHandlers.testId = testId;
			testId.update = function update(element, valueAccessor) {
				var data = ko.unwrap(valueAccessor());
				element.setAttribute('data-testid', toTestId(data));
			};
			return testId;
		});
	} else if(!!module) {
		module.exports = testId;
	}

}());
