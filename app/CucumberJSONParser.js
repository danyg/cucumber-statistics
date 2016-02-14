'use strict';

var scenariosDataStoreFactory = require('./models/scenariosModel'),
	stepsDataStoreFactory = require('./models/stepsModel'),
	coreUtils = require('../core/utils'),
	fs = require('fs'),
	zlib = require('zlib'),

	PASSED = 'passed',
	FAILED = 'failed',
	SKIPPED = 'skipped',

	STATUS_NONE = 'none',
	STATUS_FIX = 'fix',
	STATUS_AUTO_FIX= 'auto-fix',
	STATUS_RECIDIVIST = 'recidivist',
	STATUS_AUTO_RECIDIVIST = 'auto-recidivist'
;

function CucumberJSONParser(nighlyId, buildId) {
	this.nighlyId = nighlyId;
	this.buildId = buildId;

	this.scenariosModel = scenariosDataStoreFactory(this.nighlyId);
	this.stepsModel = stepsDataStoreFactory(this.nighlyId);
}

CucumberJSONParser.prototype.parse = function(json) {
	json.forEach(this._processFeature.bind(this));
};

CucumberJSONParser.prototype._processFeature = function(feature, index) {
	if(!!feature.elements) {
		feature.elements.forEach(this._processScenario.bind(this));
	} else {
		console.warn('Feature ' + index + ' doesn\'t have elements');
	}
};

CucumberJSONParser.prototype._processScenario = function(scenario) {
	if(!!scenario.steps) {
		var me = this;
		var result = {
			buildId: this.buildId,

			steps: [],

			duration: 0,
			status: null
		};

		if(!!scenario.before) {
			var resultBefore = this._processSteps(scenario.before);
			this._concatResults(result, resultBefore);
		}

		var id = scenario.id;
		if(!!scenario.steps) {
			var resultSteps = this._processSteps(scenario.steps);
			this._concatResults(result, resultSteps);
			id = this._stepsHash;
			console.log('id', id);
		}

		if(!!scenario.after) {
			var resultAfter = this._processSteps(scenario.after);
			this._concatResults(result, resultAfter);
		}

		var steps = result.steps;
		delete result.steps;
		delete scenario.id;

		scenario._id = id;
		scenario.userStatus = STATUS_NONE;
		scenario.steps = steps;

		console.log('>?id', id);
		this.scenariosModel.findOne({_id: id}, function(err, oldScenario){
			// console.log('oldScenario found?',!!oldScenario, !!oldScenario ? oldScenario._id : '');
			if(!!oldScenario) {
				scenario.userStatus = me._checkRecidivist(result, oldScenario);
			}

			me._pushScenario(scenario, steps, result);
		})


	} else {
		console.warn('Scenario ' + scenario.id + ' doesn\'t have steps');
	}

};

CucumberJSONParser.prototype._checkRecidivist = function(result, oldScenario) {
	oldScenario.results = oldScenario.results.sort(function(a,b){
		return parseInt(a.buildId, 10) > parseInt(b.buildId, 10);
	});
	var last5 = oldScenario.results.reduce(function(prev, current, ix){
		return (ix < 5) ?
			(prev === FAILED || current.status === FAILED ? FAILED : current.status) :
			prev
		;
	});
	var wasFailed = oldScenario.results.reduce(function(prev, current, ix){
		return current.status === FAILED || prev;
	}, false);

	var status = STATUS_NONE;

	if(last5 === PASSED && result.status === PASSED && wasFailed) {
		status = STATUS_AUTO_FIX;
	} else if(!!oldScenario.userStatus && oldScenario.userStatus === STATUS_FIX || oldScenario.userStatus === STATUS_AUTO_FIX ) {
		if( result.status === FAILED) {
			status = oldScenario.userStatus === STATUS_AUTO_FIX ?
				STATUS_AUTO_RECIDIVIST : STATUS_RECIDIVIST
			;
		} else {
			return oldScenario.userStatus;
		}
	}

	// console.log(oldScenario._id, '--> ', status, '| last5', last5, '| current', result.status, 'wasFailed', wasFailed, 'oldScenario.userStatus', oldScenario.userStatus||'UDEF');
	return status;
};

CucumberJSONParser.prototype._pushScenario = function(scenario, steps, result) {
	this.scenariosModel.update(
		{
			_id: scenario._id
		},
		{
			$set: {
				name: scenario.name,
				userStatus: scenario.userStatus,
				steps: steps
			},
			$push: { results: result }
		},
		{
			upsert: true
		},
		function(/*numReplaced, newDoc*/) {}
	);
};

CucumberJSONParser.prototype._concatResults = function(result, stepResults) {
	result.duration += stepResults.duration;
	result.status = this._resolveStatus(result.status, stepResults.status);
	result.steps = result.steps.concat(stepResults.steps);
};

CucumberJSONParser.prototype._processSteps = function(steps) {
	var scenarioResult = {
		duration: 0,
		status: null,
		steps: []
	};

	this._stepsHash = '';
	steps.forEach(this._processStep.bind(this, scenarioResult));
	this._stepsHash = 'dG' + coreUtils.sha256(this._stepsHash);


	return scenarioResult;
};

CucumberJSONParser.prototype._processStep = function(scenarioResult, step) {
	if(!!step && !!step.match && !!step.match.location) {
		var id = step.match.location;
		scenarioResult.duration += step.result.duration;
		scenarioResult.status = this._resolveStatus(
			scenarioResult.status,
			step.result.status
		);

		this._stepsHash += id+'-'+step.name+';';

		scenarioResult.steps.push({
			name: step.name || id,
			status: step.result.status,
			keyword: step.keyword || '',
			id: id,
			extraInfo: this._getStepExtraInfo(step, id)
		});

		this.stepsModel.update(
			{
				_id: id
			},
			{
				$addToSet: {
					name: step.name || step.match.location
				},
				$push: {
					results: step.result
				}
			},
			{
				upsert: true
			},
			function(/*numReplaced, newDoc*/) {}
		);

	}
};

CucumberJSONParser.prototype._getStepExtraInfo = function(step, stepId) {
	var extraInfo = {};
	var me = this;
	var root = process.cwd() + '/public';
	if(!!step.embeddings) {
		extraInfo.imgs = [];

		step.embeddings.forEach(function(emb) {
			var ext = '.jpg';
			if(!!emb.mime_type && emb.mime_type === 'image/png') {
				var ext = '.png';
			}

			var fName = '/n_img/' + me.nighlyId + '/' + coreUtils.sha256(emb.data) + ext;
			coreUtils.mkdir(root + fName);

			var buf = new Buffer(emb.data, 'base64');
			zlib.gzip(buf, function (_, result) {  // The callback will give you the
				fs.writeFile(root + fName + '.gz', result, function(err) {
					if(!!err) {
						console.error(err);
					}
				});
			});

			extraInfo.imgs.push(fName);
		});
	}
	if(!!step.output) {
		extraInfo.html = '';
		step.output.forEach(function(line) {
			extraInfo.html += line
				.replace(/\n/g, '<br/>')
				.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
				+ '<br/>'
			;
		});
	}
	return extraInfo;
};

CucumberJSONParser.prototype._resolveStatus = function(scenarioStatus, stepStatus) {
	if(scenarioStatus === FAILED) {
		return FAILED;
	}
	if(scenarioStatus === null) {
		return stepStatus;
	}
	if(stepStatus === FAILED) {
		return FAILED;
	}
	if(scenarioStatus === PASSED && stepStatus === SKIPPED) {
		return FAILED;
	}

	return scenarioStatus;
};

module.exports = CucumberJSONParser;