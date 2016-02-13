'use strict';

var scenariosDataStoreFactory = require('./models/scenariosModel'),
	stepsDataStoreFactory = require('./models/stepsModel'),
	coreUtils = require('../core/utils'),

	PASSED = 'passed',
	FAILED = 'failed',
	SKIPPED = 'skipped'
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
		}

		if(!!scenario.after) {
			var resultAfter = this._processSteps(scenario.after);
			this._concatResults(result, resultAfter);
		}

		var steps = result.steps;
		delete result.steps;

		this.scenariosModel.update(
			{
				_id: id
			},
			{
				$set: {
					name: scenario.name,
					steps: steps
				},
				$push: { results: result }
			},
			{
				upsert: true
			},
			function(/*numReplaced, newDoc*/) {}
		);

	} else {
		console.warn('Scenario ' + scenario.id + ' doesn\'t have steps');
	}

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
			id: id
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