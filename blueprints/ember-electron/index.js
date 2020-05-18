const Blueprint = require('ember-cli/lib/models/blueprint');
const { api } = require('@electron-forge/core');
const chalk = require('chalk');
const { electronProjectPath } = require('../../lib/utils/build-paths');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const YAWN = require('yawn-yaml/cjs');
const {
  upgradingUrl,
  routingAndAssetLoadingUrl,
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

  async afterInstall() {
    if (fs.existsSync('ember-electron')) {
      this.ui.writeLine(chalk.yellow([
        `\n'ember-electron' directory detected -- this looks like an ember-electron`,
        `v2 project. Setting up an updated project will not be destructive, but you`,
        `should read the upgrading documentation at ${upgradingUrl}.\n`
      ].join(' ')));
    }

    await this.updateEnvironmentConfig();
    await this.updateTravisYml();
    await this.updateEslintIgnore();
    await this.updateEslintRc();

    if (!fs.existsSync(electronProjectPath)) {
      await this.createElectronProject();
    } else {
      this.ui.writeLine(chalk.yellow([
        `An electron-forge project already exists at './${electronProjectPath}'.`,
        `If you're running the blueprint manually as part of an ember-electron`,
        `upgrade, make sure to check for upgrade instructions relevant to your`,
        `version upgrade at ${upgradingUrl}.\n`
      ].join(' ')));
    }
  }

  async updateEnvironmentConfig() {
    this.ui.writeLine(chalk.green('Updating config/environment.js'));

    let contents = (await readFile('config/environment.js')).toString();

    const rootURLRegex = /(\srootURL\s*:)/;
    if (rootURLRegex.test(contents)) {
      contents = contents.replace(rootURLRegex, `$1 process.env.EMBER_CLI_ELECTRON ? '' :`);
    } else {
      this.ui.writeLine(chalk.yellow([
        `\nUnable to update rootURL setting to`,
        `\`process.env.EMBER_CLI_ELECTRON ? '' : <previous value>\`,`,
        `which is needed for your Ember app to load assets under Electron.`,
        `See ${routingAndAssetLoadingUrl} for more information.`
      ].join(' ')));
    }

    const locationTypeRegex = /(\slocationType\s*:)/;
    if (locationTypeRegex.test(contents)) {
      contents = contents.replace(locationTypeRegex, `$1 process.env.EMBER_CLI_ELECTRON ? 'hash' :`);
    } else {
      this.ui.writeLine(chalk.yellow([
        `\nUnable to update locationType setting to`,
        `\`process.env.EMBER_CLI_ELECTRON ? 'hash' : <previous value>\`,`,
        `which is needed for your Ember app's routing to work under Electron.`,
        `See ${routingAndAssetLoadingUrl} for more information.`
      ].join(' ')));
    }

    await writeFile('config/environment.js', contents);
  }

  async updateTravisYml() {
    if (!fs.existsSync('.travis.yml')) {
      this.ui.writeLine(chalk.yellow([
        `\nNo .travis.yml found to update. For info on manually updating your CI`,
        `config read ${ciUrl}\n`
      ].join(' ')));
      return;
    }

    this.ui.writeLine(chalk.green('Updating .travis.yml'));

    try {
      let contents = await readFile('.travis.yml');
      let yawn = new YAWN(contents.toString());

      // Add xvfb to the packages
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

      // add install commands -- install dependencies in electron-app project,
      // and export display and launch xvfb
      let hasInstallSection = Boolean(doc.install);
      doc.install = doc.install || [];
      let usesYarn = Boolean(doc.install.find(entry => entry.includes('yarn ')));

      if (usesYarn) {
        doc.install.push('__yarn_install__');
      } else {
        if (!hasInstallSection) {
          // If no install section is specified, travis defaults to running
          // `npm install`, so if we're adding an install section, we need to
          // explicitly add that since it will no longer be run by default.
          doc.install.push('__npm_install_root__');
        }
        doc.install.push('__npm_install__');
      }

      if (!doc.install.find(entry => entry.toLowerCase().includes('xvfb'))) {
        doc.install.push('__export_display__');
        doc.install.push('__xvfb__');
      }

      // also, yawn quotes strings with certain characters in them even though
      // it isn't necessary, and it makes it harder to read. So we add
      // placeholders that won't be quoted and replace them in the output string
      yawn.json = doc;
      let output = yawn.yaml;
      output = output.replace('__yarn_install__', `cd electron-app && yarn install --non-interactive`);
      output = output.replace('__npm_install_root__', `npm install`);
      output = output.replace('__npm_install__', `cd electron-app && npm install`);
      output = output.replace('__export_display__', `export DISPLAY=':99.0'`);
      output = output.replace('__xvfb__', 'Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &');

      await writeFile('.travis.yml', output);
    } catch (e) {
      this.ui.writeLine(chalk.red([
        `Failed to update .travis.yml. For info on manually updating your CI`,
        `config read ${ciUrl}.\nError:\n${e}`
      ].join(' ')));
    }
  }

  //
  // Add the Electron project directory to .eslintignore. Perhaps at some point
  // we can put together a good pattern for linting the Electron app, but
  // currently Electron forge has no out-of-box linting, so until there's some
  // better tooling elsewhere that we can integrate with, ember-electron is
  // going to say "not my job"
  //
  async updateEslintIgnore() {
    const toAppend = [
      '',
      '# ember-electron',
      `/${electronProjectPath}/`,
    ].join('\n');

    await this.insertIntoFile('.eslintignore', toAppend);
  }

  //
  // Add testem-electron.js to the list of files in the rule that includes
  // testem.js
  //
  async updateEslintRc() {
    const after = /['"`]testem\.js['"`],/;
    const content = '\n        \'testem-electron.js\',';
    await this.insertIntoFile('.eslintrc.js', content, { after });
  }

  async createElectronProject() {
    this.ui.writeLine(chalk.green(`Creating electron-forge project at './${electronProjectPath}'`));

    await api.init({
      dir: electronProjectPath,
      interactive: true,
      template: 'ember-electron/forge/template'
    });
  }
};
