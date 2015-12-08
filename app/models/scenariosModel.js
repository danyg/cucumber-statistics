'use strict';

var modelFactory = require('../modelsHandlers/modelFactory');

/**
 * Creates a scenarios DataSource for given nightlyId
 * name scenariosDataStoreFactory
 * @param {String} nightlyId nightlyId in nightlies Model
 * @type {[type]}
 */
module.exports = modelFactory.bind(global, 'scenarios');
