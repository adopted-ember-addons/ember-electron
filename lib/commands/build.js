'use strict'

const RSVP = require('rsvp')

const fs = require('fs-extra')
const glob = require('globby')
const npmi = require('npmi')
const path = require('path')

const Command = require('ember-electron/lib/commands/-command')
const Logger = require('ember-electron/lib/utils/logger')

const {
  all,
  denodeify
} = RSVP

const availableOptions = [{
  name: 'environment',
  type: String,
  default: 'production',
  aliases: [
    'e',
    { dev: 'development' },
    { prod: 'production' }
  ]
}, {
  name: 'output-path',
  type: String,
  default: 'ember-electron/out'
}, {
  name: 'tmp-path',
  type: String,
  default: 'tmp/electron-build-tmp'
}]

module.exports = Command.extend({
  availableOptions,
  builder: null,

  run (options) {
    let logger = new Logger(this)

    if (typeof this.builder !== 'function') {
      throw new Error('Build Command is missing its `builder`')
    }

    options.outputPath = path.resolve(this.project.root, options.outputPath)
    options.tmpPath = path.resolve(this.project.root, options.tmpPath)

    return this.prepareBuild(options, logger)
      .then(() => this.builder(options, logger))
      .finally(() => this.cleanupBuild(options, logger))
  },

  prepareBuild (options, logger) {
    return this._buildApp(options, logger)
      .then(() => this._copyFiles(options, logger))
      .then(() => this._installDependencies(options, logger))
  },

  cleanupBuild (options, logger) {
    return this._removeTmpDir(options, logger)
  },

  _buildApp ({ environment, tmpPath }, logger = new Logger(this)) {
    let { ui, project, analytics } = this
    let build = new this.tasks.Build({
      ui,
      project,
      analytics
    })

    logger.startProgress('Building')

    return build.run({
      environment,
      outputPath: path.resolve(tmpPath, 'dist')
    })
  },

  _copyFiles ({ tmpPath }, logger = new Logger(this)) {
    const copy = denodeify(fs.copy)

    let ee = this.project.pkg.config['ember-electron'] || {}
    let patterns = ee['copy-files'] || [
      'ember-electron/electron.js',
      'package.json'
    ]

    logger.section([
      '',
      'Copying files into Electron Build folder'
    ])

    return all(patterns.map((pattern) => {
      return glob(pattern)
        .then((files) => all(files.map((file) => {
          logger.message(`Copying ${file}`)

          return copy(
            path.resolve(this.project.root, file),
            path.resolve(tmpPath, file)
          )
        })))
    }))
  },

  _installDependencies ({ tmpPath }, logger = new Logger(this)) {
    const install = denodeify(npmi)

    let ee = this.project.pkg.config['ember-electron'] || {}
    let deps = ee['copy-dependencies'] || this.project.pkg.dependencies
    let depNames = deps instanceof Array ? deps : Object.keys(deps)

    logger.section([
      '',
      'Installing production dependencies into Electron Build folder'
    ])

    return all(depNames.map((name) => {
      let version = this.project.pkg.dependencies[name]

      return install({
        name,
        version,
        path: tmpPath
      })
    }))
  },

  _removeTmpDir ({ tmpPath }, logger = new Logger(this)) {
    const remove = denodeify(fs.remove)

    logger.section([
      '',
      'Cleaning tmp build files'
    ])

    return remove(tmpPath)
  }
})

module.exports.availableOptions = availableOptions
