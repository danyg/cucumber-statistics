module.exports = function() {

	this.Given(/^A user is in cucumber statistics$/, function(done) {
		page.appPO.open()
			.then(function() {
				done();
			})
		;
	});

};