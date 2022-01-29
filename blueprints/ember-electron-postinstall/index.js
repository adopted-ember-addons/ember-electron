const Blueprint = require('ember-cli/lib/models/blueprint');

module.exports = class EmberElectronBlueprint extends Blueprint {
  constructor(options) {
    super(options);

    this.description = 'Instructions for post-install ember-electron setup.';
  }

  normalizeEntityName(entityName) {
    return entityName;
  }

  async afterInstall() {
    this.ui.writeLine(
      `\nRun 'ember g ember-electron' to complete ember-electron setup\n`
    );
  }
};
