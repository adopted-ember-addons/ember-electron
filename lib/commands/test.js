'use strict';

const TestCommand = require('ember-cli/lib/commands/test');
const prepareRunCommand = require('../utils/prepare-run-command');
const { emberTestBuildPath } = require('../utils/build-paths');

module.exports = TestCommand.extend({
  name: 'electron:test',
  description: "Runs your app's test suite in Electron.",

  availableOptions: buildAvailableOptions(),

  async run(commandOptions) {
    let _super = this._super;
    await prepareRunCommand(this.project);

    commandOptions.outputPath = emberTestBuildPath;
    return _super.apply(this, arguments);
  },
});

function buildAvailableOptions() {
  // Whitelist options from the base class we support so we don't turn on newly
  // added ones until developers have had a chance to review
  const supportedNames = [
    'environment',
    'config-file',
    'server',
    'test-port',
    'filter',
    'module',
    'watcher',
    'reporter',
    'silent',
    'testem-debug',
    'test-page',
    'query',
  ];
  const baseOptions = TestCommand.prototype.availableOptions;

  // Pick just the ones we support
  let availableOptions = baseOptions.filter((option) =>
    supportedNames.includes(option.name),
  );
  // Make our customizations
  availableOptions = availableOptions.map((option) => {
    // probably doesn't hurt to share un-modified options objects between
    // prototypes, but let's do this just to be safe
    option = Object.assign({}, option);

    if (option.name === 'config-file') {
      option.default = 'testem-electron.js';
    }
    return option;
  });
  return availableOptions;
}
