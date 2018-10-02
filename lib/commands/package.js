'use strict';

const Command = require('ember-cli/lib/models/command');
const PackageTask = require('../tasks/package');

module.exports = Command.extend({
  name: 'electron:package',
  description: 'Builds & packages your Electron app',

  availableOptions: [
    { name: 'environment',   type: String, default: 'development', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }], description: 'Possible values are "development", "production", and "test".' },
    { name: 'platform',      type: String, default: process.platform, aliases: ['p'] },
    { name: 'arch',          type: String, aliases: ['a'] },
    { name: 'build-path',    type: 'Path', aliases: ['b'], description: 'Reuse the build previously built via "ember electron:build" at this path rather than rebuilding.' },
    { name: 'project-path',  type: 'Path', aliases: ['i'], description: 'Reuse the project previously assembled via "ember electron:assemble" at this path rather than rebuilding/assembling.' },
    { name: 'output-path',   type: 'Path', default: 'electron-out', aliases: ['o'] },
  ],

  run(options) {
    let { ui, analytics, project } = this;
    let packageTask = new PackageTask({ ui, analytics, project });

    return packageTask.run(options);
  },
});
