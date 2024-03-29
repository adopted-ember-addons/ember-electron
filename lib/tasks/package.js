'use strict';

const chalk = require('chalk');
const Task = require('ember-cli/lib/models/task');
const { electronProjectPath } = require('../utils/build-paths');
const { api } = require('../utils/forge-core');
const path = require('path');

//
// A task that runs electron-forge package to package the app.
//
class PackageTask extends Task {
  async run(options) {
    let { ui } = this;
    let { outputPath, platform, arch } = options;

    ui.writeLine(chalk.green('Packaging Electron project.'));

    let packageOptions = {
      dir: path.resolve(electronProjectPath),
      outDir: outputPath,
    };
    if (platform) {
      packageOptions.platform = platform;
    }
    if (arch) {
      packageOptions.arch = arch;
    }

    return await api.package(packageOptions);
  }
}

module.exports = PackageTask;
