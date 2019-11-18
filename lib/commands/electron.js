'use strict';

const BaseCommand = require('./base');

module.exports = BaseCommand.extend({
  name: 'electron',
  description: 'Builds your app and launches Electron. You can pass extra flags (e.g. --inspect-brk) to Electron by putting them after `---`',

  availableOptions: [
    { name: 'watcher', type: String, default: 'events', aliases: ['w'] },
    {
      name: 'environment',
      type: String,
      default: 'development',
      aliases: ['e', { dev: 'development' }, { prod: 'production' }],
      description: 'Possible values are "development", "production", and "test".',
    }
  ],

  async run(commandOptions) {
    await this.prepareRun();

    let separatorIndex = process.argv.indexOf('---');
    if (separatorIndex !== -1) {
      commandOptions.electronArgs = process.argv.slice(separatorIndex + 1);
    }

    return await this.runTask('Electron', commandOptions);
  }
});
