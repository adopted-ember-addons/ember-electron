// Workaround for https://github.com/felixrieseberg/ember-electron/issues/320,
// caused by https://github.com/ember-cli/ember-cli/issues/7431
Object.keys(require.cache).forEach((filename) => {
  if (filename.indexOf('fs-extra') !== -1) {
    delete require.cache[filename];
  }
});

const fs = require('fs-extra');
const path = require('path');
const { all, denodeify } = require('rsvp');

try {
  // TEST
  Object.keys(require.cache).forEach((filename) => {
    if (filename.indexOf('ember-cli') !== -1) {
      delete require.cache[filename];
    }
  });

  const nm = path.join(process.cwd(), 'node_modules');
  console.log(`JRQ-DEBUG: (index.js) node_modules path -->`, nm);
  const ecliFiles = fs.readdirSync(path.join(nm, 'ember-cli'));
  console.log(`JRQ-DEBUG: (index.js) ember-cli files.length -->`, ecliFiles.length);
  const Module = require('module');
  console.log(`JRQ-DEBUG: (index.js) module globalPaths -->`, Module.globalPaths);
  console.log(`JRQ-DEBUG: (index.js) module _nodeModulePaths -->`, Module._nodeModulePaths('.'));
  //
  const originalResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function (request, parent, isMain, ...args) {
    if (request.indexOf('ember-cli') !== -1) {
      console.log(`JRQ-DEBUG: _resolveFilename request = ${request}`);
    }
    return originalResolveFilename(request, parent, isMain, ...args);
  };
  //
  console.log(`JRQ-DEBUG: (index.js) resolve 1 -->`, require.resolve('ember-cli'));
  console.log(`JRQ-DEBUG: (index.js) resolve 2 -->`, require.resolve('ember-cli/lib/models/blueprint'));
  console.log(`JRQ-DEBUG: (index.js) require blueprint -->`, require('ember-cli/lib/models/blueprint'));
  console.log(`JRQ-DEBUG: (index.js) require blueprint (.js) -->`, require(path.join(nm, 'ember-cli', 'lib', 'models', 'blueprint.js'))); // FAILS
  console.log(`JRQ-DEBUG: (index.js) finished`);
} catch (e) {
  console.log('JRQ-DEBUG: (index.js) caught exception while trying to load blueprint model (testing)', e);
}

const Blueprint = require('ember-cli/lib/models/blueprint');
const efImport = require('electron-forge/dist/api/import').default;
const { setupForgeEnv, shouldUseYarn } = require('../../lib/utils/yarn-or-npm');

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

    return this._checkForgeConfig(logger)
      .then(() => this._installElectronTooling(logger))
      .then(() => this._createResourcesDirectories(logger))
      .then(() => this._ensureForgeConfig(logger));
  }

  _checkForgeConfig(logger) {
    const readJson = denodeify(fs.readJson);

    let packageJsonPath = path.join(this.project.root, 'package.json');

    return readJson(packageJsonPath)
      .then((packageJson) => {
        let hasForgeConfig = false;
        let message;

        try {
          hasForgeConfig = packageJson.config.forge !== undefined;
        } catch(err) {
          // no-op
        }

        this.hasForgeConfig = hasForgeConfig;
        message = `Project ${hasForgeConfig ? 'has' : 'needs'} forge config`;

        logger.message(message);
      });
  }

  _installElectronTooling(logger) {
    // n.b. addPackageToProject does not let us save prod deps, so we task
    let npmInstall = this.taskFor('npm-install');
    setupForgeEnv(this.project.root);

    logger.startProgress('Installing electron build tools');

    return efImport({
      updateScripts: false,
      outDir: 'electron-out',
    })
      .then(() => npmInstall.run({
        'save-dev': true,
        verbose: false,
        packages: ['devtron@^1.4.0'],
      }))
      .then(() => npmInstall.run({
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
    let forgeConfigPath = './ember-electron/electron-forge-config.js';
    let isUsingYarn = shouldUseYarn(this.project.root);

    // If we had a forge config before running forge import, then it may be
    // customized by the user, so let's not mess with it.
    if (this.hasForgeConfig) {
      return;
    }

    logger.startProgress('Extracting ember-electron forge config');

    // Move the forge config generated by the import command out of package.json
    // and into its own file, updating package.json to point to the file.
    return readJson(packageJsonPath)
      .then((packageJson) => {
        let forgeConfig = packageJson.config.forge;

        if (typeof packageJson.config.forge === 'string') {
          return;
        }

        // required to force the package manager to use yarn when the project uses yarn
        if (isUsingYarn) {
          forgeConfig.electronPackagerConfig.packageManager = 'yarn';
        }

        forgeConfig = JSON.stringify(forgeConfig, null, 2);

        packageJson.config.forge = forgeConfigPath;

        return all([
          writeFile(forgeConfigPath, `module.exports = ${forgeConfig};`),
          writeJson(packageJsonPath, packageJson, { spaces: 2 }),
        ])
          .then(() => logger.message('Extracted ember-electron forge config'));
      });
  }
};
