'use strict';

const RSVP = require('rsvp');

const fs = require('fs-extra');
const npmi = require('npmi');
const path = require('path');
const quickTemp = require('quick-temp');

const Command = require('./-command');
const Logger = require('../utils/logger');

const {
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
    name: 'output-path',
    type: String,
    default: 'electron-out',
  },
  {
    name: 'tmp-path',
    type: String,
    default: quickTemp.makeOrRemake(this, '-electron-livereload'),
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

    options.outputPath = path.resolve(this.project.root, options.outputPath);
    options.tmpPath = path.resolve(options.tmpPath);

    return this.prepareBuild(options, logger)
      .then(() => this.builder(this.parseForgeOptions(options), logger))
      .finally(() => this.cleanupBuild(options, logger));
  },

  prepareBuild({ environment, platform, skipPackage, tmpPath }, logger) {
    if (skipPackage) {
      return resolve();
    }

    process.env.EMBER_CLI_ELECTRON_BUILD_PLATFORM = platform
      || process.platform;

    return this._buildApp({ environment, tmpPath }, logger)
      .then(() => this._installDependencies({ tmpPath }, logger));
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

  cleanupBuild({ skipPackage, tmpPath }, logger) {
    if (skipPackage) {
      return resolve();
    }

    return this._removeTmpDir({ tmpPath }, logger);
  },

  _buildApp({ environment, tmpPath }, logger = new Logger(this)) {
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
      },
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
