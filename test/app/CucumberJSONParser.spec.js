'use strict';
var BASE = require('path').resolve(__dirname + '/../..');

var fs = require('fs'),

	CucumberJSONParser = require(BASE + '/app/CucumberJSONParser'),

	scenariosModel = require(BASE + '/app/models/scenariosModel'),
	stepsModel = require(BASE + '/app/models/stepsModel'),

	sinon = require('sinon'),

	simpleMock = JSON.parse(fs.readFileSync(BASE + '/test/mocks/simple-cucumber.json'))
	// simpleMock = JSON.parse(fs.readFileSync(BASE + '/test/mocks/cucumber-external-modules.json'))
;

function assertUpdate(actualArgs) {
	var args = Array.prototype.slice.call(arguments, 1);

	for(var i = 0; i < args.length; i++) {
		expect(actualArgs[i]).toEqual(args[i], 'args[' + i + '] doesn\'t match');
	}
}

function assertUpdateLazy(actualArgs) {
	var args = Array.prototype.slice.call(arguments, 1);

	for(var i = 0; i < args.length; i++) {
		if(i === 1) {
			args[i].$set.steps = actualArgs[i].$set.steps;
		}
		expect(actualArgs[i]).toEqual(args[i], 'args[' + i + '] doesn\'t match');
	}
}

describe('CucumberJSONParser', function() {

	beforeEach(function() {
		this.scenarioUpdateStub = sinon.stub(scenariosModel, 'update');
		this.stepUpdateStub = sinon.stub(stepsModel, 'update');

		// this.scenarioUpdateStub = sinon.spy(scenariosModel, 'update');
		// this.stepUpdateStub = sinon.spy(stepsModel, 'update');
	});

	afterEach(function() {
		this.scenarioUpdateStub.restore();
		this.stepUpdateStub.restore();
	});

	it('has an Public API', function(done) {
		expect(typeof CucumberJSONParser.prototype.parse).toBe('function');

		done();
	});

	it('should parse a simple json', function(done) {
		var testee = new CucumberJSONParser('nightly', '1');

		expect(testee.buildName).toBe('nightly');
		expect(testee.buildId).toBe('1');

		testee.parse(simpleMock);

		// SCENARIO 1 UPSERT
		assertUpdate(
			this.scenarioUpdateStub.getCall(0).args,
			{
				_id: 'scenario-1'
			},
			{
				$set: {
					name: 'Scenario 1',
					steps: [
						{
							name: 'Setup.setup()',
							id: 'Setup.setup()',
							keyword: '',
							status: 'passed'
						},
						{
							name: 'the user is logged in the application',
							id: 'LoginSteps.login()',
							keyword: 'Given ',
							status: 'passed'
						},
						{
							name: 'the user interact with the application',
							id: 'Interaction.play()',
							keyword: 'When ',
							status: 'passed'
						},
						{
							name: 'the user is amazed with the application',
							id: 'Interaction.amazed()',
							keyword: 'Then ',
							status: 'passed'
						},
						{
							name: 'Setup.tearDown()',
							id: 'Setup.tearDown()',
							keyword: '',
							status: 'passed'
						}
					]
				},
				$push: {
					results: {
						buildName: 'nightly',
						buildId: '1',

						duration: 10000000000,
						status: 'passed'
					}
				}
			},
			{
				upsert: true
			}
		);

		// STEP before
		assertUpdate(
			this.stepUpdateStub.getCall(0).args,
			{
				_id: 'Setup.setup()'
			},
			{
				$addToSet: {
					name: 'Setup.setup()'
				},
				$push: {
					results: {
						duration: 1000000000,
						status: 'passed'
					}
				}
			},
			{
				upsert: true
			}
		);

		// STEP step 1
		assertUpdate(
			this.stepUpdateStub.getCall(1).args,
			{
				_id: 'LoginSteps.login()'
			},
			{
				$addToSet: {
					name: 'the user is logged in the application'
				},
				$push: {
					results: {
						duration: 5000000000,
						status: 'passed'
					}
				}
			},
			{
				upsert: true
			}
		);

		// STEP step 2
		assertUpdate(
			this.stepUpdateStub.getCall(2).args,
			{
				_id: 'Interaction.play()'
			},
			{
				$addToSet: {
					name: 'the user interact with the application'
				},
				$push: {
					results: {
						duration: 1000000000,
						status: 'passed'
					}
				}
			},
			{
				upsert: true
			}
		);

		// STEP step 3
		assertUpdate(
			this.stepUpdateStub.getCall(3).args,
			{
				_id: 'Interaction.amazed()'
			},
			{
				$addToSet: {
					name: 'the user is amazed with the application'
				},
				$push: {
					results: {
						duration: 2000000000,
						status: 'passed'
					}
				}
			},
			{
				upsert: true
			}
		);

		// STEP after
		assertUpdate(
			this.stepUpdateStub.getCall(4).args,
			{
				_id: 'Setup.tearDown()'
			},
			{
				$addToSet: {
					name: 'Setup.tearDown()'
				},
				$push: {
					results: {
						duration: 1000000000,
						status: 'passed'
					}
				}
			},
			{
				upsert: true
			}
		);

		// SCENARIO 2 UPSERT
		assertUpdateLazy(
			this.scenarioUpdateStub.getCall(1).args,
			{
				_id: 'scenario-2'
			},
			{
				$set: {
					name: 'Scenario 2',

				},
				$push: {
					results: {
						buildName: 'nightly',
						buildId: '1',

						duration: 12000000000,
						status: 'failed'
					}
				}
			},
			{
				upsert: true
			}
		);

		// SCENARIO 3 UPSERT
		assertUpdateLazy(
			this.scenarioUpdateStub.getCall(2).args,
			{
				_id: 'scenario-3'
			},
			{
				$set: {
					name: 'Scenario 3',
				},
				$push: {
					results: {
						buildName: 'nightly',
						buildId: '1',

						duration: 9000000000,
						status: 'failed'
					}
				}
			},
			{
				upsert: true
			}
		);

		done();
	});

});