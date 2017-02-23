'use strict'

const BuildCommand = require('./build')
const Logger = require('../utils/logger')

const forgePackage = require('electron-forge/dist/api/package').default

module.exports = BuildCommand.extend({
  name: 'electron:package',
  description: 'Builds your app and launches Electron',

  builder (forgeOptions, logger = new Logger(this)) {
    logger.message('Packaging app w/ `electron-forge`')

    return forgePackage(forgeOptions)
  }
})
