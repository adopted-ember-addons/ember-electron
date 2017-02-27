const Watcher = require('ember-cli/lib/models/watcher');
const Builder = require('ember-cli/lib/models/builder');

class WatchedBuild extends Watcher {
  constructor({
    ui,
    project,
    analytics,
    environment,
    outputPath,
  }) {
    let builder = new Builder({
      ui,
      project,
      environment,
      outputPath,
    });

    super({ ui, analytics, builder });
  }
}

module.exports = WatchedBuild;
