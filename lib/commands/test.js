'use strict';

let TestCommand = require('ember-cli/lib/commands/test');
let TestTask = require('../tasks/test');
let TestServerTask = require('../tasks/test-server');

module.exports = TestCommand.extend({
  name: 'electron:test',
  description: 'Runs your app\'s test suite in Electron.',

  init() {
    this._super(...arguments);
    this.tasks.TestServer = TestServerTask;
    this.tasks.Test = TestTask;
  },

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

  run() {
    process.env.EMBER_CLI_ELECTRON = true;
    return this._super(...arguments);
  },
});
