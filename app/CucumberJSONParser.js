'use strict';

const Promise = require('bluebird');

const scenariosDataStoreFactory = require('./models/scenariosModel');
const stepsDataStoreFactory = require('./models/stepsModel');
const coreUtils = require('../core/utils');
const fs = require('fs');
const zlib = require('zlib');

const PASSED = 'passed';
const FAILED = 'failed';
const SKIPPED = 'skipped';

const STATUS_NONE = 'none';
const STATUS_FIX = 'fix';
const STATUS_AUTO_FIX= 'auto-fix';
const STATUS_RECIDIVIST = 'recidivist';
const STATUS_AUTO_RECIDIVIST = 'auto-recidivist';

const LOGGER = new (require('../core/Logger'))('CucumberJSONParser');

class CucumberJSONParser {
	constructor(nighlyId, buildId) {
		this.nighlyId = nighlyId;
		this.buildId = buildId;

		this.scenariosModel = scenariosDataStoreFactory(this.nighlyId);
		this.stepsModel = stepsDataStoreFactory(this.nighlyId);

		this._pushedIds = [];
	}

	parse(json) {

		return new Promise((resolve, reject) => {

			this.promises = [];
			json.forEach(this._processFeature.bind(this));
			this.archive(json)
				.catch(err => {
					LOGGER.error(`Error archiving ${this.nighlyId}:${this.nighlyId} on ${file} ERROR:\n\t${err}`);
					reject(err);
				})
			;

			Promise.all(this.promises)
				.then(_ => resolve())
				.catch(_ => reject(_))
			;
		});
	}

	archive(json) {
		return new Promise((resolve, reject) => {
			let dir = `${process.cwd()}/archive`;
			let file = `${dir}/${this.nighlyId}_${this.buildId}.json.gz`;

			const stat = Promise.promisify(fs.lstat);
			const mkdir = Promise.promisify(fs.mkdir);
			const gzip = Promise.promisify(zlib.gzip);
			const writeFile = Promise.promisify(fs.writeFile);

			stat(dir)
				.then(stat => !stat.isDirectory() ? mkdir(dir) : true)
				.then(_ => JSON.stringify(json, null,'\t'))
				.then(data => gzip(data, {level: zlib.Z_BEST_COMPRESSION}))
				.then(gziped => writeFile(file, gziped, {flag: 'wx'}))
				.then(_ => resolve())


			;
		});
	}

	_processTags(tags) {
		if(tags === undefined) {
			return [];
		}
		return tags.map(item => {
			if(typeof item === 'string') {
				return item;
			} else if(item.hasOwnProperty('name')) {
				return item.name;
			}
		});
	}

	_processFeature(feature, index) {
		try {
			LOGGER.debug(`Processing Feature ${index} ${feature.name}...`);
			if(!!feature.elements) {
				feature.elements.forEach(this._processScenario.bind(this,
					feature.uri,
					this._processTags(feature.tags)
				));
			} else {
				LOGGER.warn(`Feature index: ${index} @ <${(feature.uri ? feature.uri : 'UNKNOWN')}> doesn't have elements`);
			}
			LOGGER.debug(`Feature ${feature.name} processed!`);
		} catch (_err) {
			LOGGER.error(`Error Processing Feature index: ${index} ${_err.toString()}\n\t${_err.stack}`);
		}
	}

	_processScenario(featureUri, featureTags, scenario, index) {
		try {
			LOGGER.debug(`Processing Scenario ${index} ${scenario.name}...`);
			if(!!scenario.steps) {
				const me = this;

				const currentExecution = {
					buildId: this.buildId,
					time: Date.now(),

					steps: [], // temporal, used by concatResults, this became scenarioToDB.steps

					duration: 0,
					status: null
				};

				const scenarioToDB = {
					_id: 'TBD',
					name: scenario.name,
					file: `${featureUri}:${scenario.line}`,
					tags: [],
					steps: [],
					userStatus: STATUS_NONE
				};

				if(!!scenario.before) {
					const resultBefore = this._processSteps(scenario.before);
					this._concatResults(currentExecution, resultBefore);
				}

				let id = scenario.id;
				if(!!scenario.steps) {
					const resultSteps = this._processSteps(scenario.steps);
					this._concatResults(currentExecution, resultSteps);
					id = this._stepsHash;
				}

				if(!!scenario.after) {
					const resultAfter = this._processSteps(scenario.after);
					this._concatResults(currentExecution, resultAfter);
				}

				const steps = currentExecution.steps;
				delete currentExecution.steps;

				scenarioToDB._id = id;
				scenarioToDB.userStatus = STATUS_NONE;
				scenarioToDB.steps = steps;

				scenarioToDB.tags = featureTags.concat(this._processTags(scenario.tags));

				LOGGER.debug('');
				LOGGER.debug('---[ Scenario ] ----------------------------------------------------------------');
				LOGGER.debug('id: ', id);
				LOGGER.debug('name: ', scenario.name);
				LOGGER.debug('');
				LOGGER.debug(`scenarioTags: ${scenarioToDB.tags.join(', ')}`);

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
				LOGGER.warn(`Scenario ${scenario.id} doesn't have steps`);
			}
		} catch (_err) {
			LOGGER.error(`Error Processing Scenario index: ${index} ${_err.toString()}\n\t${_err.stack}`);
		}
	}

	_checkRecidivist(currentExecution, oldScenario) {
		oldScenario.results = oldScenario.results.sort((a, b) =>
			parseInt(a.buildId, 10) > parseInt(b.buildId, 10)
		);
		const last5 = oldScenario.results
			.reduce((prev, current, ix) => (ix < 5) ?
				(prev === FAILED || current.status === FAILED ? FAILED : current.status) :
				prev
			)
		;
		const wasFailed = oldScenario.results
			.reduce(
				(prev, current, ix) => current.status === FAILED || prev, false
	   		)
	   	;

		let status = STATUS_NONE;

		if(last5 === PASSED && currentExecution.status === PASSED && wasFailed) {
			status = STATUS_AUTO_FIX;
		} else if(
			!!oldScenario.userStatus && (
				oldScenario.userStatus === STATUS_FIX
				|| oldScenario.userStatus === STATUS_AUTO_FIX
			)
		) {
			if( currentExecution.status === FAILED) {
				status = oldScenario.userStatus === STATUS_AUTO_FIX ?
					STATUS_AUTO_RECIDIVIST : STATUS_RECIDIVIST
				;
			} else {
				return oldScenario.userStatus;
			}
		}

		// LOGGER.debug(oldScenario._id, '--> ', status, '| last5', last5, '| current', currentExecution.status, 'wasFailed', wasFailed, 'oldScenario.userStatus', oldScenario.userStatus||'UDEF');
	}

	_pushScenario(scenarioToDB, currentExecution) {
		return new Promise((resolve, reject) => {

			LOGGER.debug(`Pushing Scenario: ${scenarioToDB.name}`);
			LOGGER.debug(`\t # id: ${scenarioToDB._id}`);
			LOGGER.debug(`\t # Steps: ${scenarioToDB.steps.length}`);
			LOGGER.debug(`\t # Tags: ${scenarioToDB.tags.join(' ')}`);
			LOGGER.debug(`\t # file: ${scenarioToDB.file}`);
			LOGGER.debug(`\n\t # result: ${JSON.stringify(currentExecution, null,'\t').replace(/\n/g, '\n\t #')}`);
			LOGGER.debug('');
			const id = scenarioToDB._id;
			delete scenarioToDB._id;

			const toSet = {
				$set: scenarioToDB,
				$addToSet: {
					aliases: {
						name: scenarioToDB.name,
						file: scenarioToDB.file
					}
				},
				$push: {
					results: currentExecution
				}
			};

			if(this._pushedIds.indexOf(id) !== -1) {
				scenarioToDB.clon = true;
			}
			this._pushedIds.push(id);

			this.scenariosModel
				.update(
					{
						_id: id
					},
					toSet,
					{
						upsert: true
					}
				)
				.then(_ => resolve(_))
				.catch(err => {
					err ? LOGGER.error(`Error upserting ${scenarioToDB.name} MESSAGE:\n\t${err.message}`) : '';
					reject(err);
				})
			;
		});
	}

	_concatResults(currentExecution, stepResults) {
		currentExecution.duration += stepResults.duration;
		currentExecution.status = this._resolveStatus(currentExecution.status, stepResults.status);
		currentExecution.steps = currentExecution.steps.concat(stepResults.steps);
	}

	_processSteps(steps) {
		const scenarioResult = {
			duration: 0,
			status: null,
			steps: []
		};

		this._stepsHash = '';
		steps.forEach(this._processStep.bind(this, scenarioResult));
		this._stepsHash = `dG${coreUtils.sha256(this._stepsHash)}`;

		return scenarioResult;
	}

	_processStep(scenarioResult, step) {
		if(!!step && !!step.match && !!step.match.location) {
			const id = step.match.location;
			scenarioResult.duration += isNaN(step.result.duration) ? 0 : step.result.duration;
			scenarioResult.status = this._resolveStatus(
				scenarioResult.status,
				step.result.status
			);

			this._stepsHash += `${id}-${step.name};`;

			scenarioResult.steps.push({
				id: id,
				name: step.name || id,
				status: step.result.status,
				keyword: step.keyword || '',
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
				() => /*numReplaced, newDoc*/{}
			);

		}
	}

	_getStepExtraInfo(step, stepId) {
		const extraInfo = {};
		const me = this;
		const root = `${process.cwd()}/public`;
		if(!!step.embeddings) {
			extraInfo.imgs = [];

			step.embeddings.forEach(emb => {
				var ext = '.jpg';
				if(!!emb.mime_type && emb.mime_type === 'image/png') {
					var ext = '.png';
				}

				const fName = `/n_img/${me.nighlyId}/${coreUtils.sha256(emb.data)}${ext}`;
				coreUtils.mkdir(root + fName);

				const buf = new Buffer(emb.data, 'base64');
				zlib.gzip(buf, (_, result) => {  // The callback will give you the
					fs.writeFile(`${root + fName}.gz`, result, err => {
						if(!!err) {
							LOGGER.error(err);
						}
					});
				});

				extraInfo.imgs.push(fName);
			});
		}
		if(!!step.result && !!step.result.error_message) {
			extraInfo.html = `<p class="code_exception">${this._parseLineToHTML(step.result.error_message)}</p>`;
		}
		if(!!step.output) {
			if(!extraInfo.hasOwnProperty('html')) {
				extraInfo.html = '';
			}
			step.output.forEach(line => {
				extraInfo.html += `${line
	.replace(/\n/g, '<br/>')
	.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')}<br/>`
				;
			});
		}
		return extraInfo;
	}

	_parseLineToHTML(line) {
		return `${line
	.replace(/\n/g, '<br/>')
	.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')}<br/>`
		;
	}

	_resolveStatus(scenarioStatus, stepStatus) {
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
	}
}
module.exports = CucumberJSONParser;