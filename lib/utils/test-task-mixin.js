'use strict';
import { deprecate } from '@ember/application/deprecations';

module.exports = {
  init() {
    // Make sure to use our version of testem, rather than ember-cli's
    this.testem = this.testem || new (require('testem'))();
    this._super(...arguments);
  },

  defaultOptions() {
    const defaultOptions = this._super(...arguments);
    defaultOptions.file = 'testem-electron.js';

    return defaultOptions;
  },

  testemOptions() {
    let testemOptions = this._super(...arguments);
    if (testemOptions) {
      testemOptions.file = 'testem-electron.js';
    }
    else {
      deprecate("In ember-cli v3.2.0 and newer, testemOptions is now called defaultOptions. Please consider upgrading to use the new method.", false);
      testemOptions = this.defaultOptions(...arguments);
    }

    return testemOptions;
  },
};
