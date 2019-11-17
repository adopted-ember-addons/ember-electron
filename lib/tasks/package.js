'use strict';

const chalk = require('chalk');
const childProcess = require('child_process');
const quickTemp = require('quick-temp');
const Task = require('ember-cli/lib/models/task');
const AssembleTask = require('./assemble');
const { setupForgeEnv } = require('../utils/yarn-or-npm');
const { api } = require('@electron-forge/core');

//
// A task that runs electron-forge pacakge to package the app. The
// projectPath/buildPath options can optionally be specified, which will be
// passed upstream to use an already-assembled project or already-built Ember
// app rather than re-assembling/rebuilding.
//
class PackageTask extends Task {
  async run(options) {
    let { ui, analytics, project } = this;
    let { projectPath, outputPath, platform, arch } = options;

    let cleanupFn;
    try {
      // If projectPath is set then we already have an assembled project
      if (!projectPath) {
        // Assemble the project and pass to forge
        projectPath = quickTemp.makeOrRemake(this, '-tmpPath');
        cleanupFn = () => quickTemp.remove(this, '-tmpPath');

        if (process.platform !== 'win32') {
          childProcess.execSync(`chmod a+x ${projectPath}`);
        }

        options.outputPath = projectPath;
        let assembleTask = new AssembleTask({ ui, analytics, project });
        await assembleTask.run(options);
      }

      setupForgeEnv(this.project.root);
      ui.writeLine(chalk.green('Packaging Electron project.'));

      let packageOptions = {
        dir: projectPath,
        outDir: outputPath,
      };
      if (platform) {
        packageOptions.platform = platform;
      }
      if (arch) {
        packageOptions.arch = arch;
      }

      return await api.package(packageOptions);
    } finally {
      if (cleanupFn) {
        cleanupFn();
      }
    }
  }
}

module.exports = PackageTask;
