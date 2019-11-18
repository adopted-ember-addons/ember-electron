'use strict';

const NpmTask = require('ember-cli/lib/tasks/npm-task');

//
// A task that determines whether ember-cli is using yarn or npm in this
// project, and sets an environment variable telling electron-forge to use the
// same so we don't have to worry about whether its detection logic is in sync
// with ember-cli's
//
class YarnOrNpmTask extends NpmTask {
  async run() {
    await this.findPackageManager();
    process.env.NODE_INSTALLER = this.useYarn ? 'yarn' : 'npm';
  }
}

module.exports = YarnOrNpmTask;
