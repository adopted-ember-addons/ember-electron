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

  run(options) {
    // If we are running in server mode, the command will use the builder and
    // we need to set the assemble option here, which will get passed to the
    // builder instance to tell it to build.
    options.assemble = true;

    return this._super(...arguments);
  },
});
