const mongoDB = require('../../core/mongoDB');
const {TEST_DB_NAME} = require('../testServer');

class DatabaseSO {
	constructor() {
		this.db = null;
	}

	wipeDatabase() {
		LOGGER.info('Wipeing Test DB out...')
		return mongoDB.connect(TEST_DB_NAME)
			.then(db => this.db = db)
			.then(this._cleanDB.bind(this))
			.then(_ => LOGGER.info('Test DB wiped out...'))
		;
	}

	_cleanDB() {
		let promises = [];

		return this.db.collections()
			.then(list => {
				return Promise.all(list.map(collection => {
					if(collection.collectionName === 'system.indexes') {
						return true;
					}
					LOGGER.debug(`Droping collection ${collection.collectionName}...`);
					return this.db.dropCollection(
							collection.collectionName
						)
						.then(_ => {
							LOGGER.debug(`Collection ${collection.collectionName} Dropped.`);
							return _;
						})
					;

				}));
			})
		;

	}

	fillDatabaseWith (dataScript) {
		let fillDB = require('../database-scripts/' + dataScript);
		return fillDB(this.db);
	}
}

module.exports = new DatabaseSO();
