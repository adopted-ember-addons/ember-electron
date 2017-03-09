const Blueprint = require('ember-cli/lib/models/blueprint');
const Logger = require('../../lib/utils/logger');
const forgeImport = require('electron-forge/dist/api/import').default;

class EmberElectronBlueprint extends Blueprint {
  constructor(options) {
    super(options);

    this.description = 'Install ember-electron in the project.';
  }

  normalizeEntityName(entityName) {
    return entityName;
  }

  afterInstall(/* options */) {
    let logger = new Logger(this);

    logger.startProgress('Installing electron build tools');

    return this.addPackagesToProject([
      {
        name: 'electron-protocol-serve',
        target: '1.1.0',
      },
    ])
      .then(() => forgeImport({ updateScripts: false }))
      .then(() => {
        let configMessage = 'Ember Electron requires configuration. Please consult the Readme to ensure that this addon works!';

        logger.message(configMessage, logger.chalk.yellow);
        logger.message('https://github.com/felixrieseberg/ember-electron');
      });
  }
}

module.exports = EmberElectronBlueprint;
