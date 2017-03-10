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

    return this.addProductionPackagesToProject([
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

  //
  // Copied from ember-cli/lib/models/blueprint.js, and modified to install
  // into dependencies instead of devDependencies
  //
  addProductionPackagesToProject(packages) {
    let task = this.taskFor('npm-install');
    let installText = (packages.length > 1) ? 'install packages' : 'install package';
    let packageNames = [];
    let packageArray = [];

    for (let i = 0; i < packages.length; i++) {
      packageNames.push(packages[i].name);

      let packageNameAndVersion = packages[i].name;

      if (packages[i].target) {
        packageNameAndVersion += `@${packages[i].target}`;
      }

      packageArray.push(packageNameAndVersion);
    }

    this._writeStatusToUI(require('chalk').green, installText, packageNames.join(', '));

    return task.run({
      save: true,
      verbose: false,
      packages: packageArray,
    });
  }
}

module.exports = EmberElectronBlueprint;
