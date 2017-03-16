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
      .then(() => this._ensureForgeConfig(logger));
  }

  _installElectronTooling(logger) {
    logger.startProgress('Installing electron build tools');

    return efImport({
      updateScripts: false,
      outDir: 'electron-out',
    })
      .then(() => this.addPackageToProject('devtron', '^1.4.0'))
      // n.b. addPackageToProject does not let us save prod deps, so we task
      .then(() => this.taskFor('npm-install').run({
        save: true,
        verbose: false,
        packages: ['electron-protocol-serve@^1.3.0'],
      }))
      .then(() => logger.message('Installed electron build tools'));
  }

  _createResourcesDirectories(logger) {
    const ensureFile = denodeify(fs.ensureFile);

    logger.startProgress('Creating ember-electron resource dirs');

    let rootDir = this.options.project.root;
    let ensureResourceDirGitKeeps = [
      'resources',
      'resources-darwin',
      'resources-linux',
      'resources-win32',
    ]
      .map((dirName) => path.join(rootDir, 'ember-electron', dirName))
      .map((dirPath) => ensureFile(path.join(dirPath, '.gitkeep')));

    return all(ensureResourceDirGitKeeps)
      .then(() => logger.message('Created ember-electron resource dirs'));
  }

  _ensureForgeConfig(logger) {
    const readJson = denodeify(fs.readJson);
    const writeFile = denodeify(fs.writeFile);
    const writeJson = denodeify(fs.writeJson);

    let packageJsonPath = path.join(this.project.root, 'package.json');
    let forgeConfigPath = './ember-electron/.electron-forge.js';

    logger.startProgress('Extracting ember-electron forge config');

    return readJson(packageJsonPath)
      .then((packageJson) => {
        let forgeConfig = `module.exports = ${packageJson.config.forge}`;
        packageJson.config.forge = forgeConfigPath;

        return all([
          writeFile(forgeConfigPath, forgeConfig),
          writeJson(packageJsonPath, packageJson, { spaces: 2 }),
        ]);
      })
      .then(() => logger.message('Extracted ember-electron forge config'));
  }
};
