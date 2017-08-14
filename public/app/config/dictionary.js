define([], function(){
	var dict = {
		'titleForRecidivist': 'Recidivist scenario, has failed after get marked as fixed.',
		'titleForAutoRecidivist': 'Recidivist scenario, has failed after get marked as fixed automaticly, previous execution was succesful.',
		'titleForNew': 'Previous execution was succesful and is failed now.',
		'titleForBrandNew': 'Is a brand new scenario and has failed in its first execution.'
	};

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

	return function dictionary(toTranslate) {
		var camelCase = camelize(toTranslate);
		if(dict.hasOwnProperty(camelCase)) {
			return dict[camelCase];
		}
		return toTranslate;
	};
});