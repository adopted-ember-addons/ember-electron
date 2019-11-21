const Blueprint = require('ember-cli/lib/models/blueprint');
const { api } = require('@electron-forge/core');
const chalk = require('chalk');
const {
  electronProjectPath,
  emberBuildDir,
  emberTestBuildDir
} = require('../../lib/utils/build-paths');
const path = require('path');
const denodeify = require('denodeify');
const fs = require('fs');
const readFile = denodeify(fs.readFile);
const writeFile = denodeify(fs.writeFile);
const YAWN = require('yawn-yaml/cjs');
const SilentError = require('silent-error');
const {
  upgradingUrl,
  ciUrl
} = require('../../lib/utils/documentation-urls');

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
        `should read the upgrading documentation at ${upgradingUrl}.\n`
      ].join(' ')));
    }
  }

  async afterInstall() {
    await this.updateTravisYml();
    await this.updateEslintIgnore();
    await this.createElectronProject();
  }

  async updateTravisYml() {
    if (!fs.existsSync('.travis.yml')) {
      this.ui.writeLine(chalk.yellow([
        `\nNo .travis.yml found to update. For info on manually updating your CI'`,
        `'config read ${ciUrl}'\n`
      ].join(' ')));
      return;
    }

    this.ui.writeLine(chalk.green('Updating .travis.yml'));

    try {
      let contents = await readFile('.travis.yml');
      let yawn = new YAWN(contents.toString());

      let doc = yawn.json;
      doc.addons = doc.addons || {};
      doc.addons.apt = doc.addons.apt || {};
      doc.addons.apt.packages = doc.addons.apt.packages || [];
      if (!doc.addons.apt.packages.includes('xvfb')) {
        doc.addons.apt.packages.push('xvfb');
      }

      // yawn doesn't do well with modifying multiple parts of the document at
      // once, so let's push the first change so it can resolve it against its AST
      // and then read the data back and perform the second operation.
      yawn.json = doc;
      doc = yawn.json;

      doc.install = doc.install || [];
      if (!doc.install.find(entry => entry.toLowerCase().includes('xvfb'))) {
        // also, yawn quotes strings with certain characters in them even though
        // it isn't necessary, and it makes it harder to read. So we add
        // placeholders that won't be quoted and replace them in the output
        // string
        doc.install.push('__export_display__');
        doc.install.push('__xvfb__');
      }

      yawn.json = doc;
      let output = yawn.yaml;
      output = output.replace('__export_display__', `export DISPLAY=':99.0'`);
      output = output.replace('__xvfb__', 'Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &');
      await writeFile('.travis.yml', output);
    } catch (e) {
      this.ui.writeLine(chalk.red([
        `Failed to update .travis.yml. For info on manually updating your CI`,
        `config read ${ciUrl}'.\nError:\n${e}`
      ].join(' ')));
    }
  }

  async updateEslintIgnore() {
    const toAppend = [
      '',
      '# ember-electron',
      `/${electronProjectPath}/node_modules/`,
      `/${electronProjectPath}/out/`,
      `/${electronProjectPath}/${emberBuildDir}/`,
      `/${electronProjectPath}/${emberTestBuildDir}/`
    ].join('\n');

    await this.insertIntoFile('.eslintignore', toAppend);
  }

  async createElectronProject() {
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
