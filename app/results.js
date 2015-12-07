'use strict';

var scenariosModel = require('./models/scenariosModel'),
	stepsModel = require('./models/stepsModel')
;

function processDoc(doc) {
	var total = doc.results.length;
	var timeSum = 0;

	doc.passed = 0;
	doc.failed = 0;
	doc.skipped = 0;

	doc.results.forEach(function(item, index) {
		doc.passed += (item.status === 'passed' ? 1 : 0);
		doc.failed += (item.status === 'failed' ? 1 : 0);
		doc.skipped += (item.status === 'skipped' ? 1 : 0);

		timeSum += item.duration;
		doc.timeAvg = Math.round(timeSum / (index+1));

		doc.stability = doc.passed / total;
	});
}

function processDocs(docs) {
	docs.forEach(processDoc.bind(null));
}

function sortByMoreFailed(a, b) {
	return a.stability - b.stability;
}

function sortByTime(a, b) {
	return b.timeAvg - a.timeAvg;
}

function Searchable(model) {
	this.model = model;
}

Searchable.prototype.getMostUnstables = function(cbk) {
	this.model.find(
		{
			'results.status': 'failed'
		},
		function(err, docs) {
			if(err) {
				cbk(new Error(err));
			} else {
				processDocs(docs);
				cbk(docs.sort(sortByMoreFailed));
			}
		}
	);
};

Searchable.prototype.getMostTimeConsuming = function(cbk) {
	this.model.find(
		{},
		function(err, docs) {
			if(err) {
				cbk(new Error(err));
			} else {
				processDocs(docs);
				cbk(docs.sort(sortByTime));
			}
		}
	);
};

Searchable.prototype.getById = function(id, cbk) {
	this.model.findOne({
		_id: id
	},function(err, doc) {
		if(err) {
			cbk(new Error(err));
		} else {
			processDoc(doc);
			cbk(doc);
		}
	});
};

module.exports = {
	Searchable: Searchable,
	implementations: {
		scenarios: new Searchable(scenariosModel),
		steps: new Searchable(stepsModel)
	}
};
