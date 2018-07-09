'use strict';
const deprecate = require('ember-cli/lib/utilities/deprecate');
const semver = require('semver');

function setTestemFile(options, file = 'testem-electron.js') {
  if (typeof options === 'object') {
    options.file = file;
  }

  return options;
}

module.exports = {
  init() {
    // Make sure to use our version of testem, rather than ember-cli's
    this.testem = this.testem || new (require('testem'))();
    this._super(...arguments);
  },

  defaultOptions() {
    return setTestemFile(this._super(...arguments));
  },

  testemOptions() {
    deprecate("In ember-cli v3.2.0 and newer, testemOptions is now called defaultOptions. Please consider upgrading to use the new method.",
      semver.gt(require('ember-cli/package.json').version, '3.2.0'));

    return setTestemFile(this._super(...arguments)) || this.defaultOptions(...arguments);
  },
};
