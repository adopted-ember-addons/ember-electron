const Blueprint = require('ember-cli/lib/models/blueprint');
const { api } = require('@electron-forge/core');
const chalk = require('chalk');
const { electronProjectPath } = require('../../lib/utils/build-paths');
const path = require('path');
const denodeify = require('denodeify');
const fs = require('fs');
const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);
const SilentError = require('silent-error');
const { upgradeUrl } = require('../../lib/utils/documentation-urls');

module.exports = class EmberElectronBlueprint extends Blueprint {
  constructor(options) {
    super(options);

    this.description = 'Install ember-electron in the project.';
  }

  normalizeEntityName(entityName) {
    return entityName;
  }

  beforeInstall() {
    if (fs.existsSync(electronProjectPath)) {
      return Promise.reject(
        new SilentError([
          `Cannot create electron-forge project at './${electronProjectPath}'`,
          `because a file or directory already exists there. Please remove/rename`,
          `it and run the blueprint again: 'ember generate ember-electron'.`
        ].join(' '))
      );
    }

    if (fs.existsSync('ember-electron')) {
      this.ui.writeLine(chalk.yellow([
        `\n'ember-electron' directory detected -- this looks like an ember-electron`,
        `v2 project. Setting up an updated project will not be destructive, but you`,
        `should read the upgrade documentation at ${upgradeUrl}.\n`
      ].join(' ')));
    }
  }

  async afterInstall() {      
    this.ui.writeLine(chalk.green(`Creating electron-forge project at './${electronProjectPath}'`));

    await api.init({
      dir: electronProjectPath,
      interactive: true,
      template: 'ember-electron/forge/template'
    });

    this.ui.writeLine(chalk.green(`Updating './${electronProjectPath}/package.json'`));

    const keysToCopy = [
      'name',
      'version',
      'description',
      'author',
      'license'
    ];

    let packageJsonPath = path.join(electronProjectPath, 'package.json');
    let packageJson = JSON.parse(await readFile(packageJsonPath));

    for (let key of keysToCopy) {
      if (Object.keys(this.project.pkg).includes(key)) {
        packageJson[key] = this.project.pkg[key];
      }
    }

    // special-case productName since forge creates it, but a lot of apps don't
    packageJson.productName = this.project.pkg.productName || packageJson.name;
    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
};
