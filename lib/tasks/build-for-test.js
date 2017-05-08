'use strict';

const BuildTask = require('./build');

//
// A task that builds for running tests -- a Build task that assembles and
// then symlinks node_modules.
//
class BuildForTestTask extends BuildTask {
  run(options) {
    options.assemble = true;
    options.symlinkNodeModules = true;

    return super.run(...arguments);
  }
}

module.exports = BuildForTestTask;
