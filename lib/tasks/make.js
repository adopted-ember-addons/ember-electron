'use strict';

const chalk = require('chalk');
const Task = require('ember-cli/lib/models/task');
const { electronProjectPath } = require('../utils/build-paths');
const { api } = require('../utils/forge-core');

//
// A task that runs electron-forge make to make installers. The skipPackage
// option can be specified to skip building/packaging and use the
// previously-packaged app matching the platform/arch.
//
class MakeTask extends Task {
  async run(options) {
    let { ui } = this;
    let { skipPackage, outputPath, platform, arch, targets } = options;

    ui.writeLine(chalk.green('Making Electron project.'));

    let makeOptions = {
      dir: electronProjectPath,
      outDir: outputPath,
      skipPackage
    };
    if (platform) {
      makeOptions.platform = platform;
    }
    if (arch) {
      makeOptions.arch = arch;
    }
    if (targets) {
      makeOptions.overrideTargets = targets;
    }

    return await api.make(makeOptions);
  }
}

module.exports = MakeTask;
