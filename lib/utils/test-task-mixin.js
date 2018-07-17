'use strict';

module.exports = {
  run(options, ...unexpectedArgs) {
    options = options || {};
    options.configFile = options.configFile || 'testem-electron.js';

    return this._super(options, ...unexpectedArgs);
  },
};
