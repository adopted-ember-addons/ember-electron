const Blueprint = require('ember-cli/lib/models/blueprint');
const { api } = require('@electron-forge/core');
const chalk = require('chalk');
const { electronProjectPath } = require('../../lib/utils/build-paths');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const path = require('path');
const execa = require('execa');
const YAWN = require('yawn-yaml/cjs');
const {
  upgradingUrl,
  routingAndAssetLoadingUrl,
  ciUrl,
} = require('../../lib/utils/documentation-urls');
const findWorkspaceRoot = require('find-yarn-workspace-root');

function isYarnProject() {
  if (fs.existsSync('yarn.lock')) {
    return true;
  }

  if (findWorkspaceRoot(process.cwd())) {
    return true;
  }

  return false;
}

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
      this.ui.writeLine(
        chalk.yellow(
          [
            `\n'ember-electron' directory detected -- this looks like an ember-electron`,
            `v2 project. Setting up an updated project will not be destructive, but you`,
            `should read the upgrading documentation at ${upgradingUrl}.\n`,
          ].join(' ')
        )
      );
    }

    await this.updateEnvironmentConfig();
    await this.updateEslintIgnore();
    await this.updateEslintRc();

    if (!fs.existsSync(electronProjectPath)) {
      await this.createElectronProject();
    } else {
      this.ui.writeLine(
        chalk.yellow(
          [
            `An electron-forge project already exists at './${electronProjectPath}'.`,
            `If you're running the blueprint manually as part of an ember-electron`,
            `upgrade, make sure to check for upgrade instructions relevant to your`,
            `version upgrade at ${upgradingUrl}.\n`,
          ].join(' ')
        )
      );
    }

    await this.fixLint();
  }

  async updateEnvironmentConfig() {
    this.ui.writeLine(chalk.green('Updating config/environment.js'));

    let contents = (await readFile('config/environment.js')).toString();

    const rootURLRegex = /(\srootURL\s*:)/;
    if (rootURLRegex.test(contents)) {
      contents = contents.replace(
        rootURLRegex,
        `$1 process.env.EMBER_CLI_ELECTRON ? '' :`
      );
    } else {
      this.ui.writeLine(
        chalk.yellow(
          [
            `\nUnable to update rootURL setting to`,
            `\`process.env.EMBER_CLI_ELECTRON ? '' : <previous value>\`,`,
            `which is needed for your Ember app to load assets under Electron.`,
            `See ${routingAndAssetLoadingUrl} for more information.`,
          ].join(' ')
        )
      );
    }

    const locationTypeRegex = /(\slocationType\s*:)/;
    if (locationTypeRegex.test(contents)) {
      contents = contents.replace(
        locationTypeRegex,
        `$1 process.env.EMBER_CLI_ELECTRON ? 'hash' :`
      );
    } else {
      this.ui.writeLine(
        chalk.yellow(
          [
            `\nUnable to update locationType setting to`,
            `\`process.env.EMBER_CLI_ELECTRON ? 'hash' : <previous value>\`,`,
            `which is needed for your Ember app's routing to work under Electron.`,
            `See ${routingAndAssetLoadingUrl} for more information.`,
          ].join(' ')
        )
      );
    }

    await writeFile('config/environment.js', contents);
  }

  //
  // Add the Electron project directory to .eslintignore. Perhaps at some point
  // we can put together a good pattern for linting the Electron app, but
  // currently Electron forge has no out-of-box linting, so until there's some
  // better tooling elsewhere that we can integrate with, ember-electron is
  // going to say "not my job"
  //
  async updateEslintIgnore() {
    const toAppend = ['', '# ember-electron', `/${electronProjectPath}/`].join(
      '\n'
    );

    await this.insertIntoFile('.eslintignore', toAppend);
  }

  //
  // Add testem-electron.js to the list of files in the rule that includes
  // testem.js
  //
  async updateEslintRc() {
    const after = /['"`]testem\.js['"`],/;
    const content = "\n        'testem-electron.js',";
    await this.insertIntoFile('.eslintrc.js', content, { after });
  }

  async createElectronProject() {
    this.ui.writeLine(
      chalk.green(
        `Creating electron-forge project at './${electronProjectPath}'`
      )
    );

    await api.init({
      dir: electronProjectPath,
      interactive: true,
      template: 'ember-electron/forge/template',
    });
  }

  //
  // Our blueprint-generated content will violate prettier's end-of-line
  // validation on Windows, so until
  // https://github.com/ember-cli/ember-cli/issues/9429 is addressed, we'll run
  // `eslint --fix` ourselves
  //
  async fixLint() {
    try {
      await execa(path.join('node_modules', '.bin', 'eslint'), ['--fix', '.']);
    } catch (e) {
      return;
    }
  }
};
