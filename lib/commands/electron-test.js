'use strict'

var TestCommand = require('ember-cli/lib/commands/test')
var TestTask = require('../tasks/electron-test')
var TestServerTask = require('../tasks/electron-test-server')

module.exports = TestCommand.extend({
  name: 'electron:test',
  description: 'Runs your app\'s test suite in Electron.',

  init: function () {
    this._super.apply(this, arguments)
    this.tasks.Test = TestTask
    this.tasks.TestServer = TestServerTask
    process.env.EMBER_CLI_ELECTRON = true
  },

  tmp: function () {
    return this.quickTemp.makeOrRemake(this, '-testsDistElectron')
  },

  rmTmp: function () {
    this.quickTemp.remove(this, '-testsDistElectron')
    this.quickTemp.remove(this, '-customConfigFile')
  }
})
