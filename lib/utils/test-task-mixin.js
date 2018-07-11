'use strict';

module.exports = {
  run(options) {
    console.log(`TestTask::run called with options.configFile=${options.configFile}`);
    options.configFile = options.configFile || 'testem-electron.js';

    return this._super(options);
  },
};
