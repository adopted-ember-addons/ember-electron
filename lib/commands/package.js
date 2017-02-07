'use strict'

const RSVP            = require('rsvp')
const fs              = require('fs-extra')
const glob            = require('globby')
const npmi            = require('npmi')
const path            = require('path')

const Command         = require('ember-cli/lib/models/command')
const Logger          = require('ember-electron/lib/utils/logger');
const forgePackage    = require('electron-forge/dist/api/package').default;

const {
  all,
  denodeify
} = RSVP;

module.exports = Command.extend({
  name: 'electron:package',
  description: 'Builds your app and launches Electron',

  init() {
    process.env.EMBER_CLI_ELECTRON = true

    if (this._super && this._super.init) {
      this._super.init.apply(this, arguments)
    }
  },

  availableOptions: [{
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
  }],
  // todo: support arch & platform options

  run(options) {
    let logger = new Logger(this);

    options.outputPath = path.resolve(this.project.root, options.outputPath);
    options.tmpPath = path.resolve(this.project.root, options.tmpPath);

    return this.build(options, logger)
      .then(() => this.copyFiles(options, logger))
      .then(() => this.installDependencies(options, logger))
      .then(() => forgePackage({
        dir: options.tmpPath,
        outDir: options.outputPath
      }))
      .finally(() => this.cleanup(options, logger));
  },

  build({ environment, tmpPath }, logger = new Logger(this)) {
    let { ui, project, analytics } = this;
    let build = new this.tasks.Build({
      ui,
      project,
      analytics
    });

    logger.startProgress('Building');

    return build.run({
      environment,
      outputPath: path.resolve(tmpPath, 'dist')
    });
  },

  copyFiles({ tmpPath }, logger = new Logger(this)) {
    const copy = denodeify(fs.copy);

    let ee = this.project.pkg.config['ember-electron'] || {};
    let patterns = ee['copy-files'] || [
      'ember-electron/electron.js',
      'package.json'
    ];

    logger.section([
      '',
      'Copying files into Electron Build folder'
    ]);

    return all(patterns.map((pattern) => {
      return glob(pattern)
        .then((files) => all(files.map((file) => {
          logger.message(`Copying ${file}`);

          return copy(
            path.resolve(this.project.root, file),
            path.resolve(tmpPath, file)
          );
        })));
    }));
  },

  installDependencies({ tmpPath }, logger = new Logger(this)) {
    const install = denodeify(npmi);

    let ee = this.project.pkg.config['ember-electron'] || {};
    let deps = ee['copy-dependencies'] || this.project.pkg.dependencies;
    let depNames = deps instanceof Array ? deps : Object.keys(deps);

    logger.section([
      '',
      'Installing production dependencies into Electron Build folder'
    ]);

    return all(depNames.map((name) => {
      let version = this.project.pkg.dependencies[name];

      return install({
        name,
        version,
        path: tmpPath
      });
    }));
  },

  cleanup({ tmpPath }, logger = new Logger(this)) {
    const remove = denodeify(fs.remove);

    logger.section([
      '',
      'Cleaning tmp build files'
    ]);

    return remove(tmpPath);
  }
});
