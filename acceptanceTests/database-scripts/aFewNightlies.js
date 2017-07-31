module.exports = function fillDB(db) {
	var put = shared.restHttpSO.putFile.bind(shared.restHttpSO);
	return shared.restHttpSO._()
		.then(_ => put('/db/set/test-nightly/1/sync', __dirname + '/n1/n1-b1.json'))
		.then(_ => put('/db/set/other-nightly/1/sync', __dirname + '/n1/n1-b2.json'))
	;
};