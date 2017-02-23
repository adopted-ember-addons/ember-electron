'use strict'

const BuildCommand = require('ember-electron/lib/commands/build')
const Logger = require('ember-electron/lib/utils/logger')

const forgeMake = require('electron-forge/dist/api/make').default

module.exports = BuildCommand.extend({
  name: 'electron:make',
  description: 'Packages your Ember + Electron app into shippable installers',

  builder ({ tmpPath, outputPath, skipPackage }, logger = new Logger(this)) {
    logger.message('Making app w/ `electron-forge`')

    return forgeMake({
      skipPackage,
      dir: tmpPath,
      outDir: outputPath
    })
  }
})
