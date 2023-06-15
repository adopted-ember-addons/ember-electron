'use strict';

const chalk = require('chalk');
const Task = require('ember-cli/lib/models/task');
const { electronProjectPath } = require('../utils/build-paths');
const { api } = require('../utils/forge-core');
const path = require('path');

//
// A task that runs electron-forge publish to publish artifacts.
//
class PublishTask extends Task {
  async run(options) {
    let { ui } = this;
    let { makeResults, publishTargets } = options;

    ui.writeLine(chalk.green('Publish Electron project.'));

    let publishOptions = {
      dir: path.resolve(electronProjectPath),
      makeResults,
      publishTargets,
    };

    return await api.publish(publishOptions);
  }
}

module.exports = PublishTask;
