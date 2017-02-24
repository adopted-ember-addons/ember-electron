'use strict';

let TestCommand = require('ember-cli/lib/commands/test');
let TestTask = require('../tasks/electron-test');
let TestServerTask = require('../tasks/electron-test-server');

module.exports = TestCommand.extend({
  name: 'electron:test',
  description: 'Runs your app\'s test suite in Electron.',

  init() {
    this._super(...arguments);
    this.tasks.Test = TestTask;
    this.tasks.TestServer = TestServerTask;
    process.env.EMBER_CLI_ELECTRON = true;
  },

  tmp() {
    return this.quickTemp.makeOrRemake(this, '-testsDistElectron');
  },

  rmTmp() {
    this.quickTemp.remove(this, '-testsDistElectron');
    this.quickTemp.remove(this, '-customConfigFile');
  },
});
