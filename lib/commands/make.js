'use strict'

const BuildCommand = require('./build')
const Logger = require('../utils/logger')

const forgeMake = require('electron-forge/dist/api/make').default

module.exports = BuildCommand.extend({
  name: 'electron:make',
  description: 'Packages your Ember + Electron app into shippable installers',

  availableOptions: BuildCommand.availableOptions.concat([{
    name: 'targets',
    type: 'String',
  }]),

  builder (forgeOptions, logger = new Logger(this)) {
    logger.message('Making app w/ `electron-forge`')
    return forgeMake(forgeOptions)
  },

  parseForgeOptions (options) {
    let parsed = this._super.parseForgeOptions.apply(this, arguments)

    if (typeof options.targets === 'string') {
      parsed.overrideTargets = options.targets.split(',');
    }

    return parsed
  }
})
