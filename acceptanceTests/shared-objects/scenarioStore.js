module.exports = {
	clean() {
		Object.keys(this).forEach((key) => {
			if(key !== 'clean' && this.hasOwnProperty(key)) {
				delete this[key];
			}
		})
	}
};