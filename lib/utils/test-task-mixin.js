'use strict';

module.exports = {
  run(options) {
    options.configFile = 'testem-electron.js';
    
    return this._super(options);
  },
};
