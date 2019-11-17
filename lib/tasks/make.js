'use strict';

const chalk = require('chalk');
const { resolve } = require('rsvp');
const Task = require('ember-cli/lib/models/task');
const PackageTask = require('./package');
const forgeMake = require('@electron-forge/core').api.make;

//
// A task that runs electron-forge make to make installers. The skipPackage
// option can be specified to skip building/assembling/packaging and use the
// previously-packaged app matching the platform/arch. If it's not specified,
// projectPath/buildPath can optionally be specified, which will be passed
// upstream to use an already-assembled project or already-built Ember app
// rather than re-assembling/rebuilding.
//
class MakeTask extends Task {
  run(options) {
    let { ui, analytics, project } = this;
    let { skipPackage, outputPath, platform, arch, targets } = options;

    let packagePromise;
    if (skipPackage) {
      // Nothing to do -- we assume the packaged app is present and let forge
      // do the rest
      packagePromise = resolve();
    } else {
      let packageTask = new PackageTask({ ui, analytics, project });
      packagePromise = packageTask.run(options);
    }

    return packagePromise.then(() => {
      ui.writeLine(chalk.green('Making Electron project.'));

      let overrideTargets;
      if (typeof targets === 'string') {
        overrideTargets = targets.split(',');
      }

      let options = {
        dir: project.root,
        outDir: outputPath,
        skipPackage: true,
        overrideTargets,
      };
      if (platform) {
        options.platform = platform;
      }
      if (arch) {
        options.arch = arch;
      }

      return forgeMake(options);
    });
  }
}

module.exports = MakeTask;
