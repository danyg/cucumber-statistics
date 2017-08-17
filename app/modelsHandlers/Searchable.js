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
	doc.lastStatus = 'unknown';
	doc.maxDuration = 0;

	doc.results = doc.results.sort(function(a , b) {
		return parseInt(a.buildId, 10) - parseInt(b.buildId, 10);
	});

	doc.timeAvg = 0;
	let avgedItems = 0;

	doc.results.forEach(function(item, index) {
		doc.maxDuration = doc.maxDuration < item.duration ? item.duration : doc.maxDuration;
		doc.passed += (item.status === 'passed' ? 1 : 0);
		doc.failed += (item.status === 'failed' ? 1 : 0);
		doc.skipped += (item.status === 'skipped' ? 1 : 0);

		if(!isNaN(item.duration)) {
			timeSum += item.duration;
			doc.timeAvg = Math.round(timeSum / (++avgedItems));
		}

		doc.stability = doc.passed / total;
		doc.lastStatus = item.status;
	});
};

Searchable.processDocs = function(docs) {
	docs.forEach(Searchable.processDoc.bind(this));
};

Searchable.sortByMoreFailed = function(a, b) {
	return a.stability - b.stability;
};

Searchable.sortByTime = function(a, b) {
	return b.timeAvg - a.timeAvg;
}

Searchable.prototype.getAll = function(cbk) {
	this.model.find().toArray(
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

Searchable.prototype.getMostUnstables = function(cbk) {
	this.model.find(
		{
			$or: [
				{'results.status': 'failed'},
				{'clon':true}
			]
		}
	).toArray(
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
	this.model.find().toArray(
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