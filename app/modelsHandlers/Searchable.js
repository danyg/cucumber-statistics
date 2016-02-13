'use strict';


// /////////////////////////////////////////////////////////////////////////////
//  Serchable Definition
// /////////////////////////////////////////////////////////////////////////////

function Searchable() {

}

Searchable.processDoc = function(doc) {
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
};

Searchable.processDocs = function(docs) {
	docs.forEach(Searchable.processDoc.bind(null));
};

Searchable.sortByMoreFailed = function(a, b) {
	return a.stability - b.stability;
};

Searchable.sortByTime = function(a, b) {
	return b.timeAvg - a.timeAvg;
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
				Searchable.processDocs(docs);
				cbk(docs.sort(Searchable.sortByMoreFailed));
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
				Searchable.processDocs(docs);
				cbk(docs.sort(Searchable.sortByTime).splice(0,10));
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
			Searchable.processDoc(doc);
			cbk(doc);
		}
	});
};

module.exports = Searchable;