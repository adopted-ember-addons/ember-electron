'use strict';

const BaseCommand = require('./base');
const { emberBuildPath } = require('../utils/build-paths');

module.exports = BaseCommand.extend({
  name: 'electron:make',
  description: 'Packages your Ember + Electron app into shippable installers',

  availableOptions: [
    { name: 'environment',   type: String,  default: 'production', aliases: ['e', { 'dev': 'development' }, { 'prod': 'production' }], description: 'Possible values are "development", "production", and "test".' },
    { name: 'platform',      type: String,  aliases: ['p'] },
    { name: 'arch',          type: String,  aliases: ['a'] },
    { name: 'targets',       type: String,  aliases: ['t'], description: 'Override the build targets specified in your electron-forge config.' },
    { name: 'skip-package',  type: Boolean, default: false, aliases: ['sp'], description: 'Skip the packaging step and use an already-packaged build from the output path.' },
    { name: 'skip-build',    type: Boolean, aliases: ['sb'], description: 'If not skipping packing step, skip the Ember build step and use an already-build from the output path.' },
    { name: 'output-path',   type: 'Path',  default: 'electron-out', aliases: ['o'] },
  ],

  async run(commandOptions) {
    await this.prepareRun();

    let { environment, skipPackage, skipBuild } = commandOptions;
    if (!skipPackage && !skipBuild) {
      await this.runTask('Build', { environment, outputPath: emberBuildPath });
    }

    if (commandOptions.targets) {
      commandOptions.targets = commandOptions.targets.split(',');
    }

    return this.runTask('ElectronMake', commandOptions);
  },
});
