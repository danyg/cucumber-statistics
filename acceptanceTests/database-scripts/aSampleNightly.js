const {cleanArchive} = require('../testServer');
const generateNightly = require('./generateNightly');
module.exports = function fillDB(db) {
	return cleanArchive().then(_ =>

		new Promise((resolve,reject) => {

			const put = shared.restHttpSO.put.bind(shared.restHttpSO);
			let promise = shared.restHttpSO._();

			for(let i = 1; i <= 5; i++) {
				LOGGER.debug(`Enqueueing sample-nightly Build/seed: ${i}...`);
				promise = promise
					.then(_ => LOGGER.debug(`Inserting sample-nightly Build/seed: ${i}...`))
					.then(_ => put(
						`/db/set/sample-nightly/${i}/sync`,
						generateNightly(i)
					))
					.then(_ => LOGGER.debug(`sample-nightly Build/seed: ${i} inserted.`))
				;
				LOGGER.debug(`sample-nightly Build/seed: ${i} enqueued.`);
			}

			promise
				.then(_ => resolve())
				.catch(_ => reject(_))
			;
		})
	);
};