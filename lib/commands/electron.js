'use strict';

const RSVP = require('rsvp');

const Command = require('./-command');
const Logger = require('../utils/logger');
const WatchedBuild = require('../utils/watched-build');
const start = require('electron-forge/dist/api/start').default;

const { Promise } = RSVP;

module.exports = Command.extend({
  name: 'electron',
  description: 'Builds your app and launches Electron',

  availableOptions: [{
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
    default: 'dist/',
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
      .then(() => {
        logger.message('Starting Electron...');

        return start({ appPath: options.outputPath });
      })
      .then((handle) => {
        return new Promise((resolve/* , reject */) => {
          handle.on('close', (code, signal) => {
            if (options.verbose) {
              logger.section([
                'Electron closed',
                `  - with code: ${code}`,
                `  - with signal: ${signal}`,
              ]);
            }
          });

          handle.on('disconnect', () => {
            if (options.verbose) {
              logger.message('Electron disconnected.');
            }
          });

          handle.on('error', (err) => {
            logger.error(err);
          });

          handle.on('exit', (/* code, signal */) => {
            logger.message('Electron exited.');
            resolve();
          });

          handle.on('message', (message) => {
            logger.message(message);
          });
        });
      });
  },

  _buildAndWatch({ environment, outputPath }, logger = new Logger(this)) {
    let { ui, project, analytics } = this;
    let watchedBuild = new WatchedBuild({
      ui,
      project,
      analytics,
      environment,
      outputPath,
    });

    // n.b. start logging progress after init to prevent immediate build-related
    //      output from stopping the spinner
    logger.startProgress('Building');

    return watchedBuild;
  },
});
