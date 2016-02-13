'use strict';
var BASE = require('path').resolve(__dirname + '/../..'),
	sinon = require('sinon'),
	proxyquire = require('proxyquire').noCallThru()
;

var scenariosModel = {
		update: sinon.stub()
	},
	stepsModel = {
		update: sinon.stub()
	},
	factories = {
		scenariosModelFactory: function() {
			return scenariosModel;
		},
		stepsModelFactory: function() {
			return stepsModel;
		}
	}
;
sinon.spy(factories, 'scenariosModelFactory');
sinon.spy(factories, 'stepsModelFactory');

var mocks = {};
mocks['./models/scenariosModel'] = factories.scenariosModelFactory;
mocks['./models/stepsModel'] = factories.stepsModelFactory;

proxyquire(BASE + '/app/CucumberJSONParser', mocks);

var fs = require('fs'),
	CucumberJSONParser = require(BASE + '/app/CucumberJSONParser'),
	// scenariosModel = require(BASE + '/app/models/scenariosModel'),
	// stepsModel = require(BASE + '/app/models/stepsModel'),
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


		this.scenarioUpdateStub = scenariosModel.update;
		this.stepUpdateStub = stepsModel.update;

		// this.scenarioUpdateStub = sinon.spy(scenariosModel, 'update');
		// this.stepUpdateStub = sinon.spy(stepsModel, 'update');
	});

	afterEach(function() {
		// factories.scenariosModelFactory.restore();
		// factories.stepsModelFactory.restore();
		factories.scenariosModelFactory.reset();
		factories.stepsModelFactory.reset();

		this.scenarioUpdateStub.reset();
		this.stepUpdateStub.reset();
	});

	it('has an Public API', function(done) {
		expect(typeof CucumberJSONParser.prototype.parse).toBe('function');

		done();
	});

	it('should parse a simple json', function(done) {
		var testee = new CucumberJSONParser('nightly', '1');

		expect(testee.nighlyId).toBe('nightly');
		expect(testee.buildId).toBe('1');

		expect(factories.scenariosModelFactory.calledWith('nightly')).toBe(true, 'scenariosDataStoreFactory wasn\'t called properly');
		expect(factories.stepsModelFactory.calledWith('nightly')).toBe(true, 'stepsDataStoreFactory wasn\'t called properly');

		testee.parse(simpleMock);

		expect(this.scenarioUpdateStub.called).toBe(true, 'scenarioModel.update wasn\'t callled');
		expect(this.stepUpdateStub.called).toBe(true, 'stepModel.update wasn\'t callled');

		// SCENARIO 1 UPSERT
		assertUpdate(
			this.scenarioUpdateStub.getCall(0).args,
			{
				_id: 'dG617cbd12e0422c41da6018fed1926f8fdc27f97ef2a222b550f731113090ff2c'
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
				_id: 'dG70707ce71558486cf341e4c5eaa92731ad154e503e2315ecacaa8c5dfc4d28e7'
			},
			{
				$set: {
					name: 'Scenario 2',

				},
				$push: {
					results: {
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
				_id: 'dG70707ce71558486cf341e4c5eaa92731ad154e503e2315ecacaa8c5dfc4d28e7'
			},
			{
				$set: {
					name: 'Scenario 3',
				},
				$push: {
					results: {
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