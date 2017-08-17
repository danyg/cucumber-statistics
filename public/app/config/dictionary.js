define([], function(){
	var dict = {
		'titleForRecidivist': 'Recidivist scenario, has failed after get marked as fixed.',
		'titleForAutoRecidivist': 'Recidivist scenario, has failed after get marked as fixed automaticly, previous execution was succesful.',
		'titleForNew': 'Previous execution was succesful and is failed now.',
		'titleForBrandNew': 'Is a brand new scenario and has failed in its first execution.',
		'titleForClon': 'Two or more scenarios has the same arrangement of steps than this one.',
		'titleForOld': 'This scenario have not been executed at least in the last build of its nightly build.',
		'titleForWithOutput': 'Expand to see Output / Error log / scenario write / etc...',
		'titleForWithImage': 'Expand to see Image'
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

	function toId(toTranslate) {
		return camelize(toTranslate);
	}

	function is(toTranslate) {
		return dict.hasOwnProperty(toId(toTranslate));
	}

	function get(toTranslate) {
		return dict[toId(toTranslate)];
	}

	function dictionary(toTranslate) {
		if(is(toTranslate)) {
			return get(toTranslate);
		}
		return toTranslate;
	};

	dictionary.is = is;
	dictionary.toId = toId;

	return dictionary;
});