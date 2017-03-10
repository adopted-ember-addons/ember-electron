'use strict';

const Command = require('ember-cli/lib/models/command');

module.exports = Command.extend({
  init() {
    process.env.EMBER_CLI_ELECTRON = true;
    this._super(...arguments);
  },
});
