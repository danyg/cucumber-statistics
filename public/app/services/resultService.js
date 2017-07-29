define([], function(){

	function ResultService(nightly){
		this._nightly = nightly;
	}


	var resultServices = {};
	function resultServiceBuilder(nightly) {
		if(!resultServices.hasOwnProperty(nightly)) {
			resultServices[nightly] = new ResultService(nightly);
		}

		return resultServices[nightly];
	}

	return resultServiceBuilder;

});