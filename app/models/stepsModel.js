'use strict';

var modelFactory = require('../modelsHandlers/modelFactory');

/**
 * Creates a steps DataSource for given nightlyId
 * name stepsDataStoreFactory
 * @param {String} nightlyId nightlyId in nightlies Model
 * @type {[type]}
 */
module.exports = modelFactory.bind(global, 'steps');
