module.exports = {
	url: 'http://localhost:9088/',
	elements: {
		filterComponent: by.testId('filters_container')
	},

	getFiltersContainer: function() {
		return driver.findElement(this.elements.filterComponent)
			.catch(_ => assert.fail(
				0,1,
				'Filter Container not Found with testId filters_container'
			))
		;
	}

}