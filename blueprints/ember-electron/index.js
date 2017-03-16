const fs = require('fs-extra');
const path = require('path');
const { all, denodeify } = require('rsvp');

const Blueprint = require('ember-cli/lib/models/blueprint');
const efImport = require('electron-forge/dist/api/import').default;

const Logger = require('../../lib/utils/logger');

module.exports = class EmberElectronBlueprint extends Blueprint {
  constructor(options) {
    super(options);

    this.description = 'Install ember-electron in the project.';
  }

  normalizeEntityName(entityName) {
    return entityName;
  }

  afterInstall(/* options */) {
    let logger = new Logger(this);

    return this._installElectronTooling(logger)
      .then(() => this._createResourcesDirectories(logger))
      .then(() => this._ensurePackageJsonConfiguration(logger));
  }

  _installElectronTooling(logger) {
    // n.b. addPackageToProject does not let us save prod deps, so we task
    let npmInstall = this.taskFor('npm-install');

    logger.startProgress('Installing electron build tools');

    return efImport({
      updateScripts: false,
      outDir: 'electron-out',
    })
      .then(() => npmInstall.run({
        saveDev: true,
        verbose: false,
        packages: ['devtron@1.4.0'],
      }))
      .then(() => this.taskFor('npm-install').run({
        save: true,
        verbose: false,
        packages: ['electron-protocol-serve@1.1.0'],
      }))
      .then(() => logger.message('Installed electron build tools'));
  }

  _createResourcesDirectories(logger) {
    const ensureFile = denodeify(fs.ensureFile);

    logger.startProgress('Creating ember-electron resource dirs');

    let rootDir = this.options.project.root;
    let promises = [
      'resources',
      'resources-darwin',
      'resources-linux',
      'resources-win32',
    ]
      .map((dirName) => path.join(rootDir, 'ember-electron', dirName))
      .map((dirPath) => ensureFile(path.join(dirPath, '.gitkeep')));

    return all(promises)
      .then(() => logger.message('Created ember-electron resource dirs'));
  }

  _ensurePackageJsonConfiguration(logger) {
    const readJson = denodeify(fs.readJson);
    const writeFile = denodeify(fs.writeFile);
    const writeJson = denodeify(fs.writeJson);

    let packageJsonPath = path.join(this.project.root, 'package.json');
    let forgeConfigPath = './ember-electron/.electron-forge';

    logger.startProgress('Extracting ember-electron forge config');

    return readJson(packageJsonPath)
      .then((packageJson) => {
        let forgeConfig = packageJson.config.forge;

        if (typeof packageJson.config.forge === 'string') {
          return;
        }

        forgeConfig = JSON.stringify(forgeConfig, 2);
        packageJson.config.forge = forgeConfigPath;

        return all([
          writeFile(forgeConfigPath, `module.exports = ${forgeConfig}`),
          writeJson(packageJsonPath, packageJson, { spaces: 2 }),
        ])
          .then(() => logger.message('Extracted ember-electron forge config'));
      });
  }
};
