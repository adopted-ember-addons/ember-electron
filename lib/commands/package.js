'use strict';

const BaseCommand = require('./base');
const { emberBuildPath, packageOutPath } = require('../utils/build-paths');

module.exports = BaseCommand.extend({
  name: 'electron:package',
  description: 'Builds & packages your Electron app',

  availableOptions: [
    {
      name: 'environment',
      type: String,
      default: 'production',
      aliases: ['e', { dev: 'development' }, { prod: 'production' }],
      description:
        'Possible values are "development", "production", and "test".',
    },
    { name: 'platform', type: String, aliases: ['p'] },
    { name: 'arch', type: String, aliases: ['a'] },
    {
      name: 'skip-build',
      type: Boolean,
      aliases: ['s'],
      description:
        'Skip the Ember build step and use an already-build from the output path.',
    },
    {
      name: 'output-path',
      type: 'Path',
      default: packageOutPath,
      aliases: ['o'],
    },
  ],

  async run(commandOptions) {
    await this.prepareRun();

    let { environment, skipBuild } = commandOptions;
    if (!skipBuild) {
      await this.runTask('Build', { environment, outputPath: emberBuildPath });
    }

    return this.runTask('ElectronPackage', commandOptions);
  },
});
