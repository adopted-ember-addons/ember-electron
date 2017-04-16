'use strict';

const Command = require('ember-cli/lib/models/command');
const MakeTask = require('../tasks/make');

module.exports = Command.extend({
  name: 'electron:make',
  description: 'Packages your Ember + Electron app into shippable installers',

  availableOptions: [
    { name: 'environment',   type: String,  default: 'development', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }], description: 'Possible values are "development", "production", and "test".' },
    { name: 'platform',      type: String,  default: process.platform, aliases: ['p'] },
    { name: 'arch',          type: String,  aliases: ['a'] },
    { name: 'targets',       type: String,  aliases: ['t'], description: 'Override the build targets specified in your electron-forge config.' },
    { name: 'build-path',    type: 'Path',  aliases: ['b'], description: 'Reuse the build previously built via "ember electron:build" at this path rather than rebuilding.' },
    { name: 'assemble-path', type: 'Path',  aliases: ['i'], description: 'Reuse the build previously assembled via "ember electron:assemble" at this path rather than rebuilding/assembling.' },
    { name: 'skip-package',  type: Boolean, aliases: ['s'], description: 'Skip the packaging step and use an already-packaged build from the output path.' },
    { name: 'output-path',   type: 'Path',  default: 'electron-out', aliases: ['o'] },
  ],

  run(options) {
    let { ui, analytics, project } = this;
    let makeTask = new MakeTask({ ui, analytics, project });

    return makeTask.run(options);
  },
});
