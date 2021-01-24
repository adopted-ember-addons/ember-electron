'use strict';

const BuildCommand = require('ember-cli/lib/commands/build');
const prepareRunCommand = require('../utils/prepare-run-command');
const { emberBuildPath } = require('../utils/build-paths');

module.exports = BuildCommand.extend({
  name: 'electron:build',
  description: `Builds your ember app for Electron and installs it in the Electron app.`,

  availableOptions: buildAvailableOptions(),

  async run() {
    let _super = this._super;
    await prepareRunCommand(this.project);
    return _super.apply(this, arguments);
  },
});

function buildAvailableOptions() {
  // We don't whitelist options here since this command maps so directly to the
  // base command (just with an extra env variable and different default output
  // path)

  return BuildCommand.prototype.availableOptions.map((option) => {
    // probably doesn't hurt to share un-modified options objects between
    // prototypes, but let's do this just to be safe
    option = Object.assign({}, option);

    if (option.name === 'output-path') {
      option.default = emberBuildPath;
    }
    return option;
  });
}
