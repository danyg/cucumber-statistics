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
	STATUS_AUTO_RECIDIVIST = 'auto-recidivist',

	LOGGER = new (require('../core/Logger'))('CucumberJSONParser')
;

function CucumberJSONParser(nighlyId, buildId) {
	this.nighlyId = nighlyId;
	this.buildId = buildId;

	this.scenariosModel = scenariosDataStoreFactory(this.nighlyId);
	this.stepsModel = stepsDataStoreFactory(this.nighlyId);
}

CucumberJSONParser.prototype.parse = function(json) {
	return new Promise((resolve, reject) => {

		this.promises = [];
		json.forEach(this._processFeature.bind(this));

		Promise.all(this.promises)
			.then(_ => resolve())
			.catch(_ => reject())
		;
	});
};

CucumberJSONParser.prototype._processTags = function(tags) {
	if(tags === undefined) {
		return [];
	}
	return tags.map(function(item) {
		return item.name;
	});
};

CucumberJSONParser.prototype._processFeature = function(feature, index) {
	try {

		if(!!feature.elements) {
			feature.elements.forEach(this._processScenario.bind(this, feature.uri, this._processTags(feature.tags)));
		} else {
			LOGGER.warn('Feature ' + index + ' doesn\'t have elements');
		}
	} catch (_err) {
		LOGGER.error('Error Processing Feature ', _err.toString() + '\n\t' + _err.stack);
	}
};

CucumberJSONParser.prototype._processScenario = function(featureUri, featureTags, scenario) {
	try {

		if(!!scenario.steps) {
			var me = this;
			var currentExecution = {
				buildId: this.buildId,
				time: Date.now(),

				steps: [], // temporal, used by concatResults, this became scenarioToDB.steps

				duration: 0,
				status: null
			},

			scenarioToDB = {
				_id: 'TBD',
				name: scenario.name,
				file: featureUri + ':' + scenario.line,
				tags: [],
				steps: [],
				userStatus: STATUS_NONE
			};

			if(!!scenario.before) {
				var resultBefore = this._processSteps(scenario.before);
				this._concatResults(currentExecution, resultBefore);
			}

			var id = scenario.id;
			if(!!scenario.steps) {
				var resultSteps = this._processSteps(scenario.steps);
				this._concatResults(currentExecution, resultSteps);
				id = this._stepsHash;
			}

			if(!!scenario.after) {
				var resultAfter = this._processSteps(scenario.after);
				this._concatResults(currentExecution, resultAfter);
			}

			var steps = currentExecution.steps;
			delete currentExecution.steps;

			scenarioToDB._id = id;
			scenarioToDB.userStatus = STATUS_NONE;
			scenarioToDB.steps = steps;

			LOGGER.debug('');
			LOGGER.debug('---[ Scenario ] ----------------------------------------------------------------');
			LOGGER.debug(scenario.name);
			LOGGER.debug('');
			LOGGER.debug('featureTags:', featureTags);
			LOGGER.debug('scenarioTags:', this._processTags(scenario.tags));

			var tags = featureTags.concat(this._processTags(scenario.tags));
			scenarioToDB.tags = tags;

			// LOGGER.debug('>?id', id);
			this.promises.push(
				this.scenariosModel.findOne({_id: id})
					.then(oldScenario => {
						if(!!oldScenario) {
							scenarioToDB.userStatus = this._checkRecidivist(currentExecution, oldScenario);
						}

						return this._pushScenario(scenarioToDB, currentExecution)
							.then(_ => { LOGGER.debug('Scenario Upserted ', id) ; return _;})
						;
					})
			);

		} else {
			LOGGER.warn('Scenario ' + scenario.id + ' doesn\'t have steps');
		}
	} catch (_err) {
		LOGGER.error('Error Processing Scenario ', _err.toString() + '\n\t' + _err.stack);
	}
};

CucumberJSONParser.prototype._checkRecidivist = function(currentExecution, oldScenario) {
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

	if(last5 === PASSED && currentExecution.status === PASSED && wasFailed) {
		status = STATUS_AUTO_FIX;
	} else if(!!oldScenario.userStatus && oldScenario.userStatus === STATUS_FIX || oldScenario.userStatus === STATUS_AUTO_FIX ) {
		if( currentExecution.status === FAILED) {
			status = oldScenario.userStatus === STATUS_AUTO_FIX ?
				STATUS_AUTO_RECIDIVIST : STATUS_RECIDIVIST
			;
		} else {
			return oldScenario.userStatus;
		}
	}

	// LOGGER.debug(oldScenario._id, '--> ', status, '| last5', last5, '| current', currentExecution.status, 'wasFailed', wasFailed, 'oldScenario.userStatus', oldScenario.userStatus||'UDEF');
	return status;
};

CucumberJSONParser.prototype._pushScenario = function(scenarioToDB, currentExecution) {
	LOGGER.debug('Pushing Scenario: ' + scenarioToDB._id);
	LOGGER.debug('\t # Steps: ' + scenarioToDB.steps.length);
	LOGGER.debug('\t # Tags: ' + scenarioToDB.tags.join(' '));
	LOGGER.debug('\t # file: ' + scenarioToDB.file);
	LOGGER.debug('');
	var id = scenarioToDB._id;
	delete scenarioToDB._id;

	return this.scenariosModel.update(
		{
			_id: id
		},
		{
			$set: scenarioToDB,
			$push: { results: currentExecution }
		},
		{
			upsert: true
		}
	)
		.catch(err => err ? LOGGER.error('Error upserting ', scenarioToDB.name, 'MESSAGE:', err.message) : '' )
	;
};

CucumberJSONParser.prototype._concatResults = function(currentExecution, stepResults) {
	currentExecution.duration += stepResults.duration;
	currentExecution.status = this._resolveStatus(currentExecution.status, stepResults.status);
	currentExecution.steps = currentExecution.steps.concat(stepResults.steps);
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
						LOGGER.error(err);
					}
				});
			});

			extraInfo.imgs.push(fName);
		});
	}
	if(!!step.result && !!step.result.error_message) {
		extraInfo.html = '<p class="code_exception">' + this._parseLineToHTML(step.result.error_message) + '</p>';
	}
	if(!!step.output) {
		if(!extraInfo.hasOwnProperty('html')) {
			extraInfo.html = '';
		}
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

CucumberJSONParser.prototype._parseLineToHTML = function(line) {
	return line
		.replace(/\n/g, '<br/>')
		.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
		+ '<br/>'
	;
}

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