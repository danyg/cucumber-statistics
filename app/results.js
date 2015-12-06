'use strict';

var scenariosModel = require('./models/scenariosModel'),
	stepsModel = require('./models/stepsModel')
;

function getScore(doc) {
	doc.results.reduce(function(passed, item, index) {
		var total = (index+1);
		passed += (item.status === 'passed' ? 1 : 0);
		doc.stability = passed / total;

		return passed;
	}, 0);

	return doc.stability;
}

function getAvg(doc) {
	doc.results.reduce(function(score, item, index) {
		score += item.duration;
		doc.timeAvg = Math.round(score / (index+1));

		return score;
	}, 0);
	return doc.timeAvg;
}

function sortByMoreFailed(a, b) {
	return getScore(a) - getScore(b);
}

function sortByTime(a, b) {
	return getAvg(b) - getAvg(a);
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
			getScore(doc);
			getAvg(doc);
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
