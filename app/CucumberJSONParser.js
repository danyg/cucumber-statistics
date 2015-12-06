'use strict';

var scenariosModel = require('./models/scenariosModel'),
	stepsModel = require('./models/stepsModel'),

	PASSED = 'passed',
	FAILED = 'failed',
	SKIPPED = 'skipped'
;

function CucumberJSONParser(buildName, buildId) {
	this.buildName = buildName;
	this.buildId = buildId;
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
			buildName: this.buildName,
			buildId: this.buildId,

			steps: [],

			duration: 0,
			status: null
		};

		if(!!scenario.before) {
			var resultBefore = this._processSteps(scenario.before);
			this._concatResults(result, resultBefore);
		}

		if(!!scenario.steps) {
			var resultSteps = this._processSteps(scenario.steps);
			this._concatResults(result, resultSteps);
		}

		if(!!scenario.after) {
			var resultAfter = this._processSteps(scenario.after);
			this._concatResults(result, resultAfter);
		}

		var steps = result.steps;
		delete result.steps;

		scenariosModel.update(
			{
				_id: scenario.id
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

	steps.forEach(this._processStep.bind(this, scenarioResult));

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

		scenarioResult.steps.push({
			name: step.name || id,
			status: step.result.status,
			keyword: step.keyword || '',
			id: id
		});

		stepsModel.update(
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