'use strict';

const chalk = require('chalk');
const Task = require('ember-cli/lib/models/task');
const PackageTask = require('./package');
const { api } = require('@electron-forge/core');

//
// A task that runs electron-forge make to make installers. The skipPackage
// option can be specified to skip building/assembling/packaging and use the
// previously-packaged app matching the platform/arch. If it's not specified,
// projectPath/buildPath can optionally be specified, which will be passed
// upstream to use an already-assembled project or already-built Ember app
// rather than re-assembling/rebuilding.
//
class MakeTask extends Task {
  async run(options) {
    let { ui, analytics, project } = this;
    let { skipPackage, outputPath, platform, arch, targets } = options;

    // If skipPackage is set, we assume the packaged app is present and let
    // forge do the rest
    if (!skipPackage) {
      let packageTask = new PackageTask({ ui, analytics, project });
      await packageTask.run(options);
    }

    ui.writeLine(chalk.green('Making Electron project.'));

    let overrideTargets;
    if (typeof targets === 'string') {
      overrideTargets = targets.split(',');
    }

    let makeOptions = {
      dir: project.root,
      outDir: outputPath,
      skipPackage: true,
      overrideTargets,
    };
    if (platform) {
      makeOptions.platform = platform;
    }
    if (arch) {
      makeOptions.arch = arch;
    }

    return await api.make(makeOptions);
  }
}

module.exports = MakeTask;
