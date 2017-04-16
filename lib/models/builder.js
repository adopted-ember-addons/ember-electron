'use strict';

let BaseBuilder = require('ember-cli/lib/models/builder');

//
// A builder that subclasses ember cli's builder model, and adds the ability to
// optionally assemble as a part of the build. This allows us to simply build
// the platform-agnostic Ember app, or build and assemble the platform-specific
// assembled package (platform-specific because of the resources-<platform>
// directory collapsing), using a single broccoli tree in either case.
//
class Builder extends BaseBuilder {
  constructor(options) {
    // platform is only used when assembling
    let { assemble, platform } = options;
    // Tell our addon that we're building for electron, so it should inject
    // shims, etc.
    process.env.EMBER_CLI_ELECTRON = true;
    if (assemble) {
      // We want to assemble as part of the broccoli build, so set these
      // environment variables to tell our addon's postProcessTree() hook to
      // include the assembly instructions.
      process.env.EMBER_CLI_ELECTRON_ASSEMBLE = true;
      process.env.EMBER_CLI_ELECTRON_PLATFORM = platform || process.platform;
    }

    super(...arguments);
  }
}

module.exports = Builder;
