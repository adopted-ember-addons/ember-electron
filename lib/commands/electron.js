'use strict'

const RSVP            = require('rsvp')

const InspectorServer = require('ember-electron/lib/utils/inspector-server');
const Logger          = require('ember-electron/lib/utils/logger');
const WatchedBuild    = require('ember-electron/lib/utils/watched-build');
const start           = require('electron-forge/dist/api/start').default;

const { Promise }   = RSVP;

module.exports = {
  name: 'electron',
  description: 'Builds your app and launches Electron',

  init: function () {
    process.env.EMBER_CLI_ELECTRON = true

    if (this._super && this._super.init) {
      this._super.init.apply(this, arguments)
    }
  },

  availableOptions: [{
    name: 'environment',
    type: String,
    default: 'development',
    aliases: [
      'e',
      { dev: 'development' },
      { prod: 'production' }
    ]
  }, {
    name: 'output-path',
    type: String,
    default: 'dist/',
    aliases: ['o']
  }, {
    name: 'verbose',
    type: Boolean,
    default: false,
    aliases: ['v']
  }],

  run: function (options) {
    let logger = new Logger(this);

    return this._buildAndWatch(options, logger)
      .then(() => this._runInspectorServer(options, logger))
      .then(() => {
        logger.message('Starting Electron...');
        logger.line();

        return start();
      })
      .then((handle) => {
        return new Promise((resolve, reject) => {
          handle.on('close', (code, signal) => {
            if (options.verbose) {
              logger.section([
                'Electron closed',
                `  - with code: ${code}`,
                `  - with signal: ${signal}`
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

          handle.on('exit', (/*code, signal*/) => {
            logger.message(`Electron exited.`)
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
      outputPath
    });

    // n.b. start logging progress after init to prevent immediate build-related
    //      output from stopping the spinner
    logger.startProgress('Building');

    return watchedBuild;
  },

  _runInspectorServer({ environment }, logger = new Logger(this)) {
    let server = new InspectorServer({
      host: 'localhost',
      port: 30820
    });

    if (environment !== 'development') {
      return;
    }

    server.run();

    logger.line();
    logger.section([
      `Ember Inspector running on ${server.getUrl()}`,
      'Open the inspector URL in a browser to debug the app!',
      'The inspector is also available as an addon inside your',
      "app's developer tools."
    ]);
    logger.line();
  }
}
