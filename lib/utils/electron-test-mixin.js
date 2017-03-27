'use strict';

module.exports = {
  init() {
    // Make sure to use our version of testem, rather than ember-cli's
    this.testem = this.testem || new (require('testem'))();
    this._super(...arguments);
  },

  testemOptions(/* options */) {
    let testemOptions = this._super(...arguments);
    testemOptions.file = 'testem-electron.js';

    return testemOptions;
  },
};
