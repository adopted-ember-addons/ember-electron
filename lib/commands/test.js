'use strict';

const TestCommand = require('ember-cli/lib/commands/test');
const { emberTestBuildPath } = require('../utils/build-paths');

module.exports = TestCommand.extend({
  name: 'electron:test',
  description: 'Runs your app\'s test suite in Electron.',

availableOptions: [
    {
      name: 'environment',
      type: String,
      default: 'test',
      aliases: ['e'],
      description: 'Possible values are "development", "production", and "test".',
    },
    {
      name: 'config-file',
      type: String,
      default: 'testem-electron.js',
      aliases: ['c', 'cf']
    },
    { name: 'server', type: Boolean, default: false, aliases: ['s'] },
    { name: 'filter', type: String, aliases: ['f'], description: 'A string to filter tests to run' },
    { name: 'module', type: String, aliases: ['m'], description: 'The name of a test module to run' },
    { name: 'watcher', type: String, default: 'events', aliases: ['w'] },
    {
      name: 'reporter',
      type: String,
      aliases: ['r'],
      description: 'Test reporter to use [tap|dot|xunit] (default: tap)',
    },
    { name: 'silent', type: Boolean, default: false, description: 'Suppress any output except for the test report' },
    { name: 'testem-debug', type: String, description: 'File to write a debug log from testem' },
    { name: 'test-page', type: String, description: 'Test page to invoke' },
    { name: 'query', type: String, description: 'A query string to append to the test page URL.' },
  ],

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

  run(commandOptions) {
    process.env.EMBER_CLI_ELECTRON = true;
    commandOptions.outputPath = emberTestBuildPath;
    return this._super(...arguments);
  },
});
