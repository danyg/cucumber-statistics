const generateNightly = require('./generateNightly');
module.exports = function fillDB(db) {
	const put = shared.restHttpSO.put.bind(shared.restHttpSO);
	let promise = shared.restHttpSO._();

	for(let i = 1; i <= 5; i++) {
		promise = promise
			.then(_ => put(
				`/db/set/sample-nightly/${i}/sync`,
				generateNightly(i)
			))
		;
	}

	return promise
		// .then(_ => process.exit())
	;
};