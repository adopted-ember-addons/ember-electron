const Watcher = require('ember-cli/lib/models/watcher');
const SafeBuilder = require('./safe-builder');

class WatchedBuild extends Watcher {
  constructor({
    ui,
    project,
    analytics,
    environment,
    outputPath,
  }) {
    let builder = new SafeBuilder({
      ui,
      project,
      environment,
      outputPath,
    });

    super({ ui, analytics, builder });
  }
}

module.exports = WatchedBuild;
