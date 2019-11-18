'use strict';

const BuildCommand = require('ember-cli/lib/commands/build');
const { emberBuildPath } = require('../utils/build-paths');

module.exports = BuildCommand.extend({
  name: 'electron:build',
  description: `Builds your ember app for Electron and installs it in the Electron app.`,

  availableOptions: [
    {
      name: 'environment',
      type: String,
      default: 'development',
      aliases: ['e', { dev: 'development' }, { prod: 'production' }],
      description: 'Possible values are "development", "production", and "test".',
    },
    { name: 'output-path', type: 'Path', default: emberBuildPath, aliases: ['o'] },
    { name: 'watch', type: Boolean, default: false, aliases: ['w'] },
    { name: 'watcher', type: String },
    { name: 'suppress-sizes', type: Boolean, default: false },
  ],

  run() {
    // Tell our addon that we're building for electron, so it should inject
    // shims, etc.
    process.env.EMBER_CLI_ELECTRON = true;

    return this._super(...arguments);
  }
});
