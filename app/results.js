'use strict';

var ScenariosSearchable = require('./modelsHandlers/ScenariosSearchable'),
	StepsSearchable = require('./modelsHandlers/StepsSearchable'),
	Searchable = require('./modelsHandlers/Searchable')
;


module.exports = {
	iface: Searchable,
	implementations: {
		scenarios: ScenariosSearchable,
		steps: StepsSearchable
	}
};
