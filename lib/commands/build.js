'use strict';

const { join } = require('path');
const BuildCommand = require('ember-cli/lib/commands/build');
const BuildTask = require('../tasks/build');

const defaultOut = join('electron-out', 'ember');

module.exports = BuildCommand.extend({
  name: 'electron:build',
  description: `Builds your ember app for Electron and places it into the output path (${defaultOut} by default).`,

  availableOptions: [
    { name: 'environment',    type: String,  default: 'development', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }], description: 'Possible values are "development", "production", and "test".' },
    { name: 'output-path',    type: 'Path',  default: defaultOut, aliases: ['o'] },
    { name: 'suppress-sizes', type: Boolean, default: false },
  ],

  init() {
    this._super(...arguments);
    this.tasks.Build = BuildTask;
  },
});
