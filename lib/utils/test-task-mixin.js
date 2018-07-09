'use strict';

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
    return setTestemFile(this._super(...arguments)) || this.defaultOptions(...arguments);
  },
};
