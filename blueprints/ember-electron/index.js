const fs = require('fs-extra');
const path = require('path');
const { all, denodeify } = require('rsvp');
const Blueprint = require('ember-cli/lib/models/blueprint');
const Logger = require('../../lib/utils/logger');

const writeJson = denodeify(fs.writeJson);
const readJson = denodeify(fs.readJson);
const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);
const ensureFile = denodeify(fs.ensureFile);

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

    return this._installDependencies(logger)
      .then(() => this._createResourcesDirectories())
      .then(() => this._ensurePackageJsonConfiguration())
      .then(() => this._updateGitignore())
      .then(() => {
        let configMessage = 'Ember Electron requires configuration. Please consult the Readme to ensure that this addon works!';
        logger.message(configMessage, logger.chalk.yellow);
        logger.message('https://github.com/felixrieseberg/ember-electron');
      });
  }

  _installDependencies(logger) {
    // Since addPackagesToProject() doesn't give us fine-grained control over save vs. save-dev,
    // or the exact flag, we use:
    let task = this.taskFor('npm-install');

    logger.startProgress('Installing electron tools (electron-forge + electron-protocol-serve)');

    // There are two parts of electron-forge's import command that are relevant to us.
    // One is installing dependencies, and the other is setting up the electron-forge configuration.
    // Rather than embedding the forge configuration inline in package.json
    // we want it in an external file, so we install the dependencies here ourselves
    // (including our own dependencies), and add an entry to package.json
    // pointing the forge config to the config file that is copied from the blueprint files.

    const { devDeps, exactDevDeps, deps } = require('electron-forge/dist/init/init-npm');

    return task.run({
      'save-dev': true,
      verbose: false,
      packages: devDeps
    }).then(() => task.run({
      // Dependencies we need to keep locked at specific versions
      'save-dev': true,
      'save-exact': true,
      verbose: false,
      packages: exactDevDeps
    })).then(() => task.run({
      // Production dependencies
      save: true,
      verbose: true,
      packages: ['electron-protocol-serve@1.1.0', ...deps]
    }));
  }

  _createResourcesDirectories() {
    const platforms = ['', 'darwin', 'linux', 'win32'];
    let promises = platforms.map((platform) => {
      let gitKeepPath = path.join(this.options.project.root, 'ember-electron', `resources${platform ? '-' : ''}${platform}`, '.gitkeep');
      return ensureFile(gitKeepPath);
    });

    return all(promises);
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

  _updateGitignore() {
    let gitignorePath = path.join(this.project.root, '.gitignore');
    let toAdd = '/electron-out';
    return readFile(gitignorePath)
      .then((gitignore) => {
        let lines = gitignore.toString().split('\n');
        if (lines.includes(toAdd)) {
          return;
        }

        // Try to put it next to '/tmp' (in the built output section)
        let tmpIndex = lines.indexOf('/tmp');
        if (tmpIndex !== -1) {
          lines.splice(tmpIndex + 1, 0, toAdd);
        } else {
          lines.push('');
          lines.push(toAdd);
        }

        return writeFile(gitignorePath, lines.join('\n'));
      });
  }
}

module.exports = EmberElectronBlueprint;
