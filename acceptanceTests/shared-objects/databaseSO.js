const mongoDB = require('../../core/mongoDB');
const {TEST_DB_NAME} = require('../testServer');

class DatabaseSO {
	constructor() {
		this.db = null;
	}

	wipeDatabase() {
		return mongoDB.connect(TEST_DB_NAME)
			.then(db => this.db = db)
			.then(this._cleanDB.bind(this))
			.then(_ => console.log('Testing DB wiped out...'))
		;
	}

	_cleanDB() {
		let promises = [];
		return new Promise((ok, fail) => {
			this.db.collections((err, list) => {
				err ? fail(err): err;
				promises.concat(
					list.map(colName => new Promise((reject, resolve) => {
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log('ABOUT TO DROP ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						console.log(' ', colName);
						reject();
						// db.dropCollection(colName, function(err, r){
						// 	err ? reject(err) : resolve(r);
						// });
					}))
				);
				Promise.all(promises)
					.then(ok)
					.catch(fail)
				;
			});
		});
	}

	fillDatabaseWith (dataScript) {
		let fillDB = require('../database-scripts/' + dataScript);
		fillDB(this.db);
	}
}

module.exports = new DatabaseSO();
