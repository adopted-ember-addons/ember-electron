'use strict';

const RSVP = require('rsvp');
const path = require('path');

const Command = require('ember-cli/lib/models/command');
const Builder = require('../models/builder');
const Watcher = require('ember-cli/lib/models/watcher');
const Logger = require('../utils/logger');
const { api } = require('@electron-forge/core');

const { Promise } = RSVP;

module.exports = Command.extend({
  name: 'electron',
  description: 'Builds your app and launches Electron. You can pass extra flags (e.g. --inspect-brk) to Electron by putting them after `---`',

  availableOptions: [{
    name: 'watcher',
    type: String,
    default: 'events',
    aliases: ['w'],
  },
  {
    name: 'environment',
    type: String,
    default: 'development',
    aliases: [
      'e',
      { dev: 'development' },
      { prod: 'production' },
    ],
  }, {
    name: 'output-path',
    type: String,
    default: path.join('electron-out', 'project'),
    aliases: ['o'],
  }, {
    name: 'verbose',
    type: Boolean,
    default: false,
    aliases: ['v'],
  }],

  run(options) {
    let logger = new Logger(this);

    return this._buildAndWatch(options, logger)
      .then(() => this._startElectron(options, logger));
  },

  _buildAndWatch({ environment, outputPath, watcher }) {
    const { ui, project, analytics } = this;
    const builder = new Builder({
      ui,
      project,
      environment,
      outputPath,
      assemble: true,
      symlinkNodeModules: true,
    });
    const buildWatcher = new Watcher({
      ui,
      builder,
      analytics,
      options: { watcher },
    });

    return buildWatcher;
  },

  async _startElectron({ outputPath, verbose }, logger = new Logger(this)) {
    const argv = this._getArgv();

    let electronArgs = [];
    let separatorIndex = argv.indexOf('---');
    if (separatorIndex !== -1) {
      electronArgs = argv.slice(separatorIndex + 1);
      logger.message(`Starting Electron with args '${electronArgs.join(' ')}'...`);
    } else {
      logger.message('Starting Electron...');
    }

    outputPath = path.resolve(outputPath);

    let handle = await api.start({ appPath: outputPath, dir: outputPath, args: electronArgs });

    handle.on('close', (code, signal) => {
      if (verbose) {
        logger.section([
          'Electron closed',
          `  - with code: ${code}`,
          `  - with signal: ${signal}`,
        ]);
      }
    });

    handle.on('disconnect', () => {
      if (verbose) {
        logger.message('Electron disconnected.');
      }
    });

    handle.on('error', (err) => {
      logger.error(err);
    });

    handle.on('message', (message) => {
      logger.message(message);
    });

    await new Promise((resolve) => {
      handle.on('exit', () => {
        logger.message('Electron exited.');
        resolve();
      });
    });
  },

  // For test instrumentation
  _getArgv() {
    return process.argv;
  },
});
