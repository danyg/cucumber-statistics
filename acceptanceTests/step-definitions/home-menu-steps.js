module.exports = function() {

	this.When(/^the nightly "([^"]+)" is selected$/, function(nightlyName, done) {
		page.menuPO.selectNightly(nightlyName)
			.then(function() {
				done();
			})
		;
	});

	this.Then(/^the user is presented with an error message "([^"]+)" in the main menu$/, function(expectedMessage, done) {
		page.menuPO.getErrMsg()
			.then(elm => elm.getText())
			.then(text => expect(text).to.equal(expectedMessage, "The error message present a text different to expected"))
			.then(_ => done())
		;
	});

};