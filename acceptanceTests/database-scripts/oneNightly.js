module.exports = function fillDB(db) {
	return shared.restHttpSO.putFile('/db/set/test-nightly/1/sync', __dirname + '/n1/n1-b1.json')
		// .then(_ => shared.restHttpSO.putFile('/db/set/test-nightly/2', __dirname + '/n1/n1-b2.json'))
		// .then(response => LOGGER.debug('\n\n\n===[ RESPONSE ]============\n',response))

		// .then(_ => process.exit())
	;

};