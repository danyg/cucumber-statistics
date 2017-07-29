module.exports = function() {

	this.Then(/^the "([^"]+)" container is displayed$/, function(containerTitle, done) {
		var elm = page.appPO.getContainer(containerTitle);

		page.appPO.getContainerTitleText(containerTitle).then(
			actual => {
				assert.equal(
					actual,
					containerTitle,
					'The title of the container is not as expected'
				);
				done();
			}
		);
	});

};
