'use strict';

const Command = require('ember-cli/lib/models/command');
const ElectronTask = require('../tasks/electron');
const ElectronMakeTask = require('../tasks/make');
const ElectronPackageTask = require('../tasks/package');
const ElectronPublishTask = require('../tasks/publish');
const PnpmYarnOrNpmTask = require('../tasks/pnpm-yarn-or-npm');
const prepareRunCommand = require('../utils/prepare-run-command');

module.exports = Command.extend({
  init() {
    this._super(...arguments);
    Object.assign(this.tasks, {
      Electron: ElectronTask,
      ElectronMake: ElectronMakeTask,
      ElectronPackage: ElectronPackageTask,
      ElectronPublish: ElectronPublishTask,
      PnpmYarnOrNpm: PnpmYarnOrNpmTask,
    });
  },

  async prepareRun() {
    // Set up the yarn/npm environment variable so forge uses the right package
    // manager
    await this.runTask('PnpmYarnOrNpm');

    await prepareRunCommand(this.project);
  },
});
