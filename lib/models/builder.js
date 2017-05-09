'use strict';

const BaseBuilder = require('ember-cli/lib/models/builder');
const fs = require('fs-extra');
const path = require('path');
const symlinkOrCopySync = require('symlink-or-copy').sync;
const rimraf = require('rimraf').sync;

//
// A builder that subclasses ember cli's builder model, and adds the ability to
// optionally assemble as a part of the build. This allows us to simply build
// the platform-agnostic Ember app, or build and assemble the platform-specific
// assembled package (platform-specific because of the resources-<platform>
// directory collapsing), using a single broccoli tree in either case.
//
// This builder can also optionally create a symlink from the output path to our
// project's node_modules, e.g., for `ember electron` or
// `ember electron:test -s`.
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

  copyToOutputPath() {
    // This will invoke tree-sync, which we can't let find our node_modules
    // symlink or it will traverse into it and run amok, deleting folders out
    // of our project's node_modules.
    this._unsymlinkModules();
    let ret;
    try {
      ret = super.copyToOutputPath(...arguments);
    } finally {
      this._symlinkModules();
    }

    return ret;
  }

  _unsymlinkModules() {
    if (!this.symlinkNodeModules) {
      return;
    }

    const { outputPath } = this;
    const modules = path.join(outputPath, 'node_modules');

    if (outputPath && fs.existsSync(modules)) {
      // Will unlink if it's a symlink or recursively delete if not
      rimraf(modules);
    }
  }

  _symlinkModules() {
    if (!this.symlinkNodeModules) {
      return;
    }

    const { outputPath } = this;
    const source = path.join(this.project.root, 'node_modules');
    const target = path.join(outputPath, 'node_modules');

    fs.mkdirsSync(outputPath);
    symlinkOrCopySync(source, target);
  }
}

module.exports = Builder;
