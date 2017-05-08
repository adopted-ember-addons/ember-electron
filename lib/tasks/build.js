'use strict';

const chalk = require('chalk');
const Task = require('ember-cli/lib/models/task');
const Builder = require('../models/builder');

//
// A task that builds out the Ember app shimmed to run in electron,
// optionally assembles the app into an electron forge-compatible project, and
// optionally symlinks node_modules to the project's node_modules.
//
class BuildTask extends Task {
  // platform is only used when assembling
  run({ outputPath, environment, assemble, symlinkNodeModules, platform }) {
    let { ui, project } = this;

    let progressMessage;
    let successMessage;
    if (assemble) {
      progressMessage = 'Building and assembling';
      successMessage = 'Built and assembled';
    } else {
      progressMessage = 'Building';
      successMessage = 'Built';
    }

    ui.startProgress(chalk.green(progressMessage), chalk.green('.'));

    let builder = new Builder({
      ui,
      outputPath,
      environment,
      assemble,
      symlinkNodeModules,
      platform,
      project,
    });

    return builder.build()
      .finally(() => {
        ui.stopProgress();

        return builder.cleanup();
      })
      .then(() => ui.writeLine(chalk.green(`${successMessage} Electron project successfully. Stored in "${outputPath}".`)))
      .catch((err) => {
        ui.writeLine(chalk.red('Build failed.'));

        throw err;
      });
  }
}

module.exports = BuildTask;
