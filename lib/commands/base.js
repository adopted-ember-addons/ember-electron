'use strict';

const Command = require('ember-cli/lib/models/command');
const ElectronTask = require('../tasks/electron');
const ElectronMakeTask = require('../tasks/make');
const ElectronPackageTask = require('../tasks/package');
const YarnOrNpmTask = require('../tasks/yarn-or-npm');
const prepareRunCommand = require('../utils/prepare-run-command');

module.exports = Command.extend({
  init() {
    this._super(...arguments);
    Object.assign(this.tasks, {
      Electron: ElectronTask,
      ElectronMake: ElectronMakeTask,
      ElectronPackage: ElectronPackageTask,
      YarnOrNpm: YarnOrNpmTask
    });
  },

  async prepareRun() {
    // Set up the yarn/npm environment variable so forge uses the right package
    // manager
    await this.runTask('YarnOrNpm');

    await prepareRunCommand(this.project);
  }
});
