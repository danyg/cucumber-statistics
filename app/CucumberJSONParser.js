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

			duration: 0,
			status: null
		};

		var resultBefore = this._processSteps(scenario.before);
		var resultSteps = this._processSteps(scenario.steps);
		var resultAfter = this._processSteps(scenario.after);

		result.duration += resultBefore.duration;
		result.status = this._resolveStatus(result.status, resultBefore.status);

		result.duration += resultSteps.duration;
		result.status = this._resolveStatus(result.status, resultSteps.status);

		result.duration += resultAfter.duration;
		result.status = this._resolveStatus(result.status, resultAfter.status);

		scenariosModel.update(
			{
				_id: scenario.id
			},
			{
				$set: {
					name: scenario.name
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

CucumberJSONParser.prototype._processSteps = function(steps) {
	var scenarioResult = {
		duration: 0,
		status: null
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

		stepsModel.update(
			{
				_id: id
			},
			{
				$addToSet: {
					name: step.name || ''
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