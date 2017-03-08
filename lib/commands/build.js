'use strict';

const RSVP = require('rsvp');
const {
  all,
  denodeify,
  resolve,
} = RSVP;

const fs = require('fs-extra');
const [ copy, remove ] = ['copy', 'remove'].map(method => denodeify(fs[method]));
const glob = require('globby');
const npmi = require('npmi');
const path = require('path');

const Command = require('./-command');
const Logger = require('../utils/logger');


const availableOptions = [{
  name: 'environment',
  type: String,
  default: 'production',
  aliases: [
    'e',
    { dev: 'development' },
    { prod: 'production' },
  ],
}, {
  name: 'platform',
  type: String,
}, {
  name: 'arch',
  type: String,
}, {
  name: 'dist-path',
  type: String,
  default: 'dist',
}, {
  name: 'output-path',
  type: String,
  default: 'ember-electron/out',
}, {
  name: 'tmp-path',
  type: String,
  default: 'tmp/electron-build-tmp',
}, {
  name: 'skip-build',
  type: Boolean,
  default: false,
}, {
  name: 'skip-package',
  type: Boolean,
  default: false,
}];

module.exports = Command.extend({
  availableOptions,
  builder: null,

  run(options) {
    let logger = new Logger(this);

    if (typeof this.builder !== 'function') {
      throw new Error('Build Command is missing its `builder`');
    }

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
      .then(() => this._copyFiles(options, logger))
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


    logger.message(`Skipping Ember build; copying ${distPath} to ${tmpPath}`);

    return copy(
      path.resolve(this.project.root, distPath),
      path.resolve(tmpPath, 'dist')
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
      outputPath: path.resolve(tmpPath, 'dist'),
    });
  },

  /**
   * _copyFiles combines the assets needed for a given platform.
   * Files inside of `ember-electron/public/` apply to all platforms,
   * and they may be overridden by platform-specific files in
   * `ember-electron/public-${platform}/` folders
   * (where `${platform}` is a string like Node's process.platform would return,
   * e.g. 'darwin', 'linux', or 'win32').
   *
   * See issue #123
   * https://github.com/felixrieseberg/ember-electron/issues/123
   *
   * @private
   */
  _copyFiles({ platform = process.platform, tmpPath }, logger = new Logger(this)) {

    // Detect 1.x style configuration ('ember-electron' -> 'copy-files' section of package.json)
    let ee = this.project.pkg.config['ember-electron'] || {};
    if (ee['copy-files']) {
      logger.error('The "copy-files" configuration option is no longer supported. ' +
        'Use the "ember-electron/public" folder instead. ' +
        'See https://github.com/felixrieseberg/ember-electron/issues/123 for more details.');
    }

    logger.section(['Copying files into Electron Build folder']);

    let patterns = [
      '.compilerc',
      'package.json',
      'ember-electron/electron.js',
      'ember-electron/public/*',
      `ember-electron/public-${platform}/*`
    ];

    // This RegEx is used to strip the ember-electron/public[-platform]/ base path
    // so that those special folders merge like they're supposed to.
    const pathAdjustingRegEx = new RegExp(`^ember-electron/public(-${platform})?/`);

    return all(patterns.map((pattern) => {
      return glob(pattern)
        .then((files) => all(files.map((file) => {
          const adjustedFile = file.replace(pathAdjustingRegEx, '');
          logger.message(`Copying ${file} -> ${adjustedFile}`);

          return copy(
            path.resolve(this.project.root, file),
            path.resolve(tmpPath, adjustedFile)
          );
        })));
    }));
  },

  _installDependencies({ tmpPath }, logger = new Logger(this)) {
    const install = denodeify(npmi);

    let ee = this.project.pkg.config['ember-electron'] || {};
    let deps = ee['copy-dependencies'] || this.project.pkg.dependencies;
    let depNames = deps instanceof Array ? deps : Object.keys(deps);

    logger.section([
      '',
      'Installing production dependencies into Electron Build folder',
    ]);

    return all(depNames.map((name) => {
      let version = this.project.pkg.dependencies[name];

      return install({
        name,
        version,
        path: tmpPath,
      });
    }));
  },

  _removeTmpDir({ tmpPath }, logger = new Logger(this)) {

    logger.section([
      '',
      'Cleaning tmp build files',
    ]);

    return remove(tmpPath);
  },
});

module.exports.availableOptions = availableOptions;
