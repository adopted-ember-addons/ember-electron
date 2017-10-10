'use strict';

const chalk = require('chalk');
const execa = require('execa');
const Task = require('ember-cli/lib/models/task');
const BuildTask = require('./build');
const Assembler = require('../models/assembler');
const { shouldUseYarn } = require('../utils/yarn-or-npm');

//
// A task for assembling an electron forge-compatible project by combining the
// ember app with the contents of the ember-electron/ directory plus a copy of
// package.json, and installing production dependencies. The output should be
// runnable via `forge start -p <path>`.
//
// A path to an already-built electron app can optionally be specified via
// `buildPath`, in which case it will be used instead of rebuilding the Ember
// app in a temp directory.
//
class AssembleTask extends Task {
  run(options) {
    let { ui, analytics, project } = this;
    let { buildPath, outputPath } = options;

    let assemblePromise;
    if (buildPath) {
      // We have a build path, so we're just assembling via an AssembleTask
      assemblePromise = this.assemble(options);
    } else {
      // We are building and assembling, so do both in the same broccoli tree
      // via a BuildTask with the assemble options set.
      let buildTask = new BuildTask({ ui, analytics, project });
      options.assemble = true;
      assemblePromise = buildTask.run(options);
    }

    return assemblePromise.then(() => this.installDependencies(ui, outputPath));
  }

  assemble({ buildPath, outputPath, platform }) {
    let { ui, project } = this;
    ui.startProgress(chalk.green('Assembling Electron project'), chalk.green('.'));

    let assembler = new Assembler({
      ui,
      platform,
      emberBuildPath: buildPath,
      outputPath,
      project,
    });

    return assembler.assemble()
      .finally(() => {
        ui.stopProgress();

        return assembler.cleanup();
      })
      .then(() => ui.writeLine(chalk.green(`Assembled Electron project successfully. Stored in "${outputPath}".`)))
      .catch((err) => {
        ui.writeLine(chalk.red('Assembly failed.'));

        throw err;
      });
  }

  pruneCommand() {
    if (shouldUseYarn(this.project.root)) {
      return 'yarn install --production --no-bin-links';
    } else {
      return 'npm install --production --no-bin-links';
    }
  }

  installDependencies(ui, path) {
    ui.startProgress('installing production dependencies');

    let [command, ...args] = this.pruneCommand().split(' ');

    return execa(
      command,
      args,
      { cwd: path }
    ).catch().then(() => {
      ui.stopProgress();
    });
  }
}

module.exports = AssembleTask;
