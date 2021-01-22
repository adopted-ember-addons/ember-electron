'use strict';

const TestCommand = require('ember-cli/lib/commands/test');
const prepareRunCommand = require('../utils/prepare-run-command');
const { emberTestBuildPath } = require('../utils/build-paths');

module.exports = TestCommand.extend({
  name: 'electron:test',
  description: "Runs your app's test suite in Electron.",

  availableOptions: buildAvailableOptions(),

  rmTmp() {
    if (process.platform === 'win32') {
      // There is some kind of race condition where we intermittently get EBUSY
      // deleting the temp directory on windows, which causes the test to fail.
      // Unfortunately adding logging to try to track it down makes it go away,
      // so let's just delay for a bit as a dirty workaround.
      require('child_process').execSync('ping 127.0.0.1 -n 2 > nul');
    }

    return this._super(...arguments);
  },

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
    supportedNames.includes(option.name)
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
