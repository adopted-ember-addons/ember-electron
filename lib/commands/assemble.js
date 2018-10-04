'use strict';

const { join } = require('path');
const Command = require('ember-cli/lib/models/command');
const AssembleTask = require('../tasks/assemble');

const defaultOut = join('electron-out', 'project');

module.exports = Command.extend({
  name: 'electron:assemble',
  description: `Assembles your app and places it into the output path (${defaultOut} by default).`,

  availableOptions: [
    { name: 'environment', type: String,  default: 'development', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }], description: 'Possible values are "development", "production", and "test".' },
    { name: 'platform',    type: String,  default: process.platform, aliases: ['p'] },
    { name: 'build-path',  type: 'Path', aliases: ['i'], description: 'Reuse the build previously built via "ember electron:build" at this path rather than rebuilding.' },
    { name: 'output-path', type: 'Path',  default: defaultOut, aliases: ['o'] },
  ],

  run(options) {
    let { ui, analytics, project } = this;
    let assembleTask = new AssembleTask({ ui, analytics, project });

    return assembleTask.run(options);
  },
});
