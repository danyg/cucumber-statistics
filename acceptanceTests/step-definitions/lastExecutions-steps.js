module.exports = function() {

	this.Then(/^the user is presented with the Filter Tags component$/, function(done){
		page.lastExecutionsPO.getFiltersContainer()
			.then(e => done())
		;
	});

};
