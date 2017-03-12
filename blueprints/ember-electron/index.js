const fs = require('fs-extra');
const path = require('path');
const { denodeify } = require('rsvp');
const Blueprint = require('ember-cli/lib/models/blueprint');
const Logger = require('../../lib/utils/logger');
const { devDeps, exactDevDeps, deps } = require('electron-forge/dist/init/init-npm');

const writeJson = denodeify(fs.writeJson);
const readJson = denodeify(fs.readJson);

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
    let task = this.taskFor('npm-install');

    logger.startProgress('Installing electron build tools');

    // There are two parts of electron-forge's import command that are relevant
    // to us. One is installing dependencies, and the other is setting up the
    // electron-forge configuration. However, it sets up the forge
    // configuration inline in package.json, and we want it in an external
    // file, so we install the dependencies here ourselves (including our own
    // dependencies), and add an entry to package.json pointing the forge
    // config to the config file that is copied from the blueprint files.
    //
    // addPackagesToProject() doesn't give us fine-grained control over save
    // vs. save-dev, or the exact flag, so we need to
    return task.run({
      'save-dev': true,
      verbose: false,
      packages: devDeps
    }).then(() => task.run({
      'save-dev': true,
      'save-exact': true,
      verbose: false,
      packages: exactDevDeps
    })).then(() => task.run({
      save: true,
      verbose: true,
      packages: ['electron-protocol-serve@1.1.0', ...deps]
    })).then(() => this._ensurePackageJsonConfiguration())
      .then(() => {
      let configMessage = 'Ember Electron requires configuration. Please consult the Readme to ensure that this addon works!';

      logger.message(configMessage, logger.chalk.yellow);
      logger.message('https://github.com/felixrieseberg/ember-electron');
    });
  }

  _ensurePackageJsonConfiguration() {
    let packageJsonPath = path.join(this.project.root, 'package.json');
    // We can't use this.project.pkg because we modified package.json by
    // installing dependencies, and that won't be reflected in this.project.pkg
    return readJson(packageJsonPath)
      .then((packageJson) => {
        packageJson.config = packageJson.config || {};
        packageJson.config.forge = './ember-electron/.electron-forge';

        return writeJson(packageJsonPath, packageJson, { spaces: 2 });
      });
  }
}

module.exports = EmberElectronBlueprint;
