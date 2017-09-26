'use strict';

const chalk = require('chalk');
const childProcess = require('child_process');
const { resolve } = require('rsvp');
const quickTemp = require('quick-temp');
const Task = require('ember-cli/lib/models/task');
const AssembleTask = require('./assemble');
const { setupForgeEnv } = require('../utils/yarn-or-npm');
const forgePackage = require('electron-forge/dist/api/package').default;

//
// A task that runs electron-forge pacakge to package the app. The
// projectPath/buildPath options can optionally be specified, which will be
// passed upstream to use an already-assembled project or already-built Ember
// app rather than re-assembling/rebuilding.
//
class PackageTask extends Task {
  run(options) {
    let { ui, analytics, project } = this;
    let { projectPath, outputPath, platform, arch } = options;

    let assemblePromise;
    if (projectPath) {
      // We have a path to an assembled project, so just pass it to forge
      assemblePromise = resolve();
    } else {
      // Assemble the project and pass to forge
      projectPath = quickTemp.makeOrRemake(this, '-tmpPath');

      if (process.platform !== 'win32') {
        childProcess.execSync(`chmod a+x ${projectPath}`);
      }

      options.outputPath = projectPath;
      let assembleTask = new AssembleTask({ ui, analytics, project });
      assemblePromise = assembleTask.run(options);
    }

    return assemblePromise.then(() => {
      setupForgeEnv(this.project.root);
      ui.writeLine(chalk.green('Packaging Electron project.'));

      let options = {
        dir: projectPath,
        outDir: outputPath,
      };
      if (platform) {
        options.platform = platform;
      }
      if (arch) {
        options.arch = arch;
      }

      return forgePackage(options);
    }).finally(() => {
      quickTemp.remove(this, '-tmpPath');
    });
  }
}

module.exports = PackageTask;
