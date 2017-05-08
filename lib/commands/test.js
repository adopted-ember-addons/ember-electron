'use strict';

let TestCommand = require('ember-cli/lib/commands/test');
let Builder = require('../models/builder');
let BuildForTestTask = require('../tasks/build-for-test');
let TestTask = require('../tasks/test');
let TestServerTask = require('../tasks/test-server');

module.exports = TestCommand.extend({
  name: 'electron:test',
  description: 'Runs your app\'s test suite in Electron.',

  init() {
    this._super(...arguments);
    // Used if we are running in server mode
    this.Builder = Builder;
    this.tasks.TestServer = TestServerTask;
    // Used if we're not running in server mode
    this.tasks.Build = BuildForTestTask;
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

  run(options) {
    // If we are running in server mode, the command will use the builder and
    // we need to set the assemble and symlinkNodeModules options here, which
    // will get passed to the builder instance. If we're not running in server
    // mode, we can't pass any options through to the build task, which is why
    // we set it to the BuildForTestTask in init(), which forces these flags on.
    options.assemble = true;
    options.symlinkNodeModules = true;

    return this._super(...arguments);
  },
});
