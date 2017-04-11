'use strict';

const BuildTask = require('./build');

//
// A task that builds and then assembles. Really it's just a BuildTask that
// forces the assemble options to true. This is only used in the build command,
// which is a subclass of ember cli's build command, and needs a task class to
// override this.tasks.Build.
//
class BuildAndAssembleTask extends BuildTask {
  run(options) {
    options.assemble = true;

    return super.run(...arguments);
  }
}

module.exports = BuildAndAssembleTask;
