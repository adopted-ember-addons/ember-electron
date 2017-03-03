const RSVP = require('rsvp');
const fs = require('fs-extra');
const path = require('path');

const Blueprint = require('ember-cli/lib/models/blueprint');
const Logger = require('../../lib/utils/logger');
const forgeImport = require('electron-forge/dist/api/import').default;

const {
  denodeify,
  resolve,
} = RSVP;

const {
  readJson,
  writeJson,
} = fs;

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

    logger.startProgress('Installing electron build tools');

    return forgeImport({ updateScripts: false })
      .then(() => this._ensurePackageJsonConfiguration())
      .then(() => {
        let configMessage = 'Ember Electron requires configuration. Please consult the Readme to ensure that this addon works!';

        logger.message(configMessage, logger.chalk.yellow);
        logger.message('https://github.com/felixrieseberg/ember-electron');
      });
  }

  _ensurePackageJsonConfiguration() {
    let packageJsonPath = path.join(this.project.root, 'package.json');

    if (this.project.pkg.main !== undefined) {
      return resolve();
    }

    return denodeify(readJson)(packageJsonPath)
      .then((json) => {
        json.main = 'ember-electron/electron.js';

        if (json.config === undefined) {
          json.config = {};
        }

        json.config['ember-electron'] = {
          'copy-files': [
            'ember-electron/electron.js',
            'package.json',
          ],
        };

        return denodeify(writeJson)(packageJsonPath, json, { spaces: 2 });
      });
  }
}

module.exports = EmberElectronBlueprint;
