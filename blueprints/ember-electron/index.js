const RSVP           = require('rsvp');
const VersionChecker = require('ember-cli-version-checker')
const fs             = require('fs-extra');
const path           = require('path');

const Blueprint      = require('ember-cli/lib/models/blueprint');
const Logger         = require('ember-electron/lib/utils/logger');
const forgeImport    = require('electron-forge/dist/api/import').default;

const {
  denodeify,
  resolve
} = RSVP;

const {
  readJson,
  writeJson
} = fs;

class EmberElectronBlueprint extends Blueprint {
  constructor(options) {
    super(options);

    this.description = 'Install ember-electron in the project.';
  }

  normalizeEntityName(entityName) {
    return entityName;
  }

  afterInstall(options) {
    let logger = new Logger(this);

    logger.startProgress('Installing electron build tools');

    return forgeImport({ updateScripts: false })
      .then(() => this._ensurePackageJsonMainConfigured())
      .then(() => {
        // todo: update readme once upstream forge needs confirmed
        let configMessage = 'Ember Electron requires configuration. Please consult the Readme to ensure that this addon works!'

        logger.message(configMessage, logger.chalk.yellow);
        logger.message('https://github.com/felixrieseberg/ember-electron');
      });
  }

  // todo: replace with direct replacement in config/env & log warnings
  locals(options) {
    const checker = new VersionChecker(this);
    const dep = checker.for('ember-cli', 'npm');

    let baseURLOption = "baseURL: '/',";
    let baseURLTestOption = "ENV.baseURL = '/';";

    if (dep.satisfies('>= 2.7.0')) {
      baseURLOption = 'rootURL: null,';
      baseURLTestOption = '';
    }

    return { baseURLOption, baseURLTestOption };
  }

  _ensurePackageJsonMainConfigured() {
    let packageJsonPath = path.join(this.project.root, 'package.json');

    if (this.project.pkg.main !== undefined) {
      return resolve();
    }

    return denodeify(readJson)(packageJsonPath)
      .then((json) => {
        json.main = 'ember-electron/electron.js';
        return denodeify(writeJson)(packageJsonPath, json, { spaces: 2 });
      });
  }
};

module.exports = EmberElectronBlueprint;
