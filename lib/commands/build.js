'use strict';

const RSVP = require('rsvp');

const fs = require('fs-extra');
const npmi = require('npmi');
const path = require('path');

const Command = require('./-command');
const Logger = require('../utils/logger');

const {
  all,
  denodeify,
  resolve,
} = RSVP;

const availableOptions = [
  {
    name: 'environment',
    type: String,
    default: 'production',
    aliases: [
      'e',
      { dev: 'development' },
      { prod: 'production' },
    ],
  },
  {
    name: 'platform',
    type: String,
  },
  {
    name: 'arch',
    type: String,
  },
  {
    name: 'dist-path',
    type: String,
    default: 'dist',
  },
  {
    name: 'output-path',
    type: String,
    default: 'electron-out',
  },
  {
    name: 'tmp-path',
    type: String,
    default: 'tmp/electron-build-tmp',
  },
  {
    name: 'skip-build',
    type: Boolean,
    default: false,
  },
  {
    name: 'skip-package',
    type: Boolean,
    default: false,
  },
];

module.exports = Command.extend({
  availableOptions,
  builder: null,

  run(options) {
    let logger = new Logger(this);

    if (typeof this.builder !== 'function') {
      throw new Error('Build Command is missing its `builder`');
    }

    // Set the platform in the environment so index.js knows what
    // platform-specific files to include when setting up the broccoli pipeline
    process.EMBER_CLI_ELECTRON_BUILD_PLATFORM = options.platform || process.platform;

    options.outputPath = path.resolve(this.project.root, options.outputPath);
    options.tmpPath = path.resolve(this.project.root, options.tmpPath);

    return this.prepareBuild(options, logger)
      .then(() => this.builder(this.parseForgeOptions(options), logger))
      .finally(() => this.cleanupBuild(options, logger));
  },

  prepareBuild(options, logger) {
    if (options.skipPackage) {
      return resolve();
    }

    return this.buildApp(options, logger)
      .then(() => this._installDependencies(options, logger));
  },

  cleanupBuild(options, logger) {
    if (options.skipPackage) {
      return resolve();
    }

    return this._removeTmpDir(options, logger);
  },

  buildApp(options, logger = new Logger(this)) {
    if (options.skipBuild) {
      return this._copyDistToTmp(options, logger);
    }

    return this._buildAppToTmp(options, logger);
  },

  parseForgeOptions(options) {
    const parseableOptions = ['skipPackage', 'platform', 'arch'];

    let parsed = {
      dir: options.tmpPath,
      outDir: options.outputPath,
    };

    parseableOptions.forEach((key) => {
      if (options[key]) {
        parsed[key] = options[key];
      }
    });

    return parsed;
  },

  _copyDistToTmp({ distPath, tmpPath }, logger = new Logger(this)) {
    const copy = denodeify(fs.copy);

    logger.message(`Skipping Ember build; copying ${distPath} to ${tmpPath}`);

    return copy(
      path.resolve(this.project.root, distPath),
      tmpPath
    );
  },

  _buildAppToTmp({ environment, tmpPath }, logger = new Logger(this)) {
    let { ui, project, analytics } = this;
    let build = new this.tasks.Build({
      ui,
      project,
      analytics,
    });

    logger.startProgress(`Building to ${tmpPath}`);

    return build.run({
      environment,
      outputPath: tmpPath,
    });
  },

  _installDependencies({ tmpPath }, logger = new Logger(this)) {
    const install = denodeify(npmi);

    logger.section([
      '',
      'Installing production dependencies into Electron Build folder',
    ]);

    return install({
      path: tmpPath,
      npmLoad: {
        production: true,
        progress: false,
        logLevel: 'error',
      }
    });
  },

  _removeTmpDir({ tmpPath }, logger = new Logger(this)) {
    const remove = denodeify(fs.remove);

    logger.section([
      '',
      'Cleaning tmp build files',
    ]);

    return remove(tmpPath);
  },
});

module.exports.availableOptions = availableOptions;
