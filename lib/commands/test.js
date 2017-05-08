'use strict';

let TestCommand = require('ember-cli/lib/commands/test');
let Builder = require('../models/builder');
let BuildAndAssembleTask = require('../tasks/build-and-assemble');
let TestTask = require('../tasks/test');
let TestServerTask = require('../tasks/test-server');

module.exports = TestCommand.extend({
  name: 'electron:test',
  description: 'Runs your app\'s test suite in Electron.',

  init() {
    this._super(...arguments);
    this.Builder = Builder;
    this.tasks.Build = BuildAndAssembleTask;
    this.tasks.Test = TestTask;
    this.tasks.TestServer = TestServerTask;
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

  run(options) {
    // If we are running in server mode, the command will use the builder and
    // we need to set the assemble option here, which will get passed to the
    // builder instance to tell it to build.
    options.assemble = true;

    return this._super(...arguments);
  },
});
