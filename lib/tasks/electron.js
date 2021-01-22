'use strict';

const chalk = require('chalk');
const Task = require('ember-cli/lib/models/task');
const Watcher = require('ember-cli/lib/models/watcher');
const Builder = require('ember-cli/lib/models/builder');
const ExpressServer = require('ember-cli/lib/tasks/server/express-server');
const path = require('path');
const { electronProjectPath, emberBuildPath } = require('../utils/build-paths');
const debug = require('debug')('ember-electron:electron-task');
const { api } = require('../utils/forge-core');

class ElectronTask extends Task {
  async run(options) {
    let { ui } = this;

    ui.startProgress(chalk.green('Building'), chalk.green('.'));

    let builder = new Builder({
      ui,
      outputPath: emberBuildPath,
      environment: options.environment,
      project: this.project
    });

    ui.writeLine(`Environment: ${options.environment}`);

    let watcher = new Watcher({
      ui,
      builder,
      analytics: this.analytics,
      options
    });

    let expressServer = new ExpressServer({
      ui: this.ui,
      project: this.project,
      analytics: this.analytics,
      watcher,
      serverRoot: './server'
    });

    await Promise.all([expressServer.start(options), watcher]);
    await this._runElectron(builder, options);
  }

  async _runElectron(builder, { electronArgs = [] }) {
    if (electronArgs.length > 0) {
      this.ui.writeLine(
        chalk(`Starting Electron with args '${electronArgs.join(' ')}'...`)
      );
    } else {
      this.ui.writeLine(chalk('Starting Electron...'));
    }

    let proc = await api.start({
      dir: path.resolve(electronProjectPath),
      args: electronArgs
    });

    proc.on('close', (code, signal) => {
      debug(`Electron closed with code: ${code} with signal: ${signal}`);
    });

    proc.on('disconnect', () => {
      debug('Electron disconnected.');
    });

    proc.on('error', (err) => {
      debug(`Error: ${err.stack || err}`);
    });

    proc.on('message', (message) => {
      debug(message);
    });

    await new Promise((resolve) => {
      proc.on('exit', () => {
        debug('Electron exited.');
        resolve();
      });
    });

    await builder.cleanup();
  }
}

module.exports = ElectronTask;
