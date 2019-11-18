const Blueprint = require('ember-cli/lib/models/blueprint');
const { api } = require('@electron-forge/core');
const chalk = require('chalk');

module.exports = class EmberElectronBlueprint extends Blueprint {
  constructor(options) {
    super(options);

    this.description = 'Install ember-electron in the project.';
  }

  normalizeEntityName(entityName) {
    return entityName;
  }

  async afterInstall(/* options */) {
    this.ui.writeLine(chalk.green('Creating electron-forge project at `./electron`'));

    await api.init({
      dir: 'electron',
      interactive: true,
      template: 'ember-electron/forge/template'
    });
  }
};
