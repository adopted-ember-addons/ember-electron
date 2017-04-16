const Builder = require('../models/builder');
const fs = require('fs-extra');
const path = require('path');
const symlinkOrCopySync = require('symlink-or-copy').sync;

class SafeBuilder extends Builder {
  constructor() {
    super(...arguments);
  }

  _unsymlinkModules() {
    const { outputPath } = this;
    const modules = path.join(outputPath, 'node_modules');

    if (outputPath && fs.existsSync(modules)) {
      fs.unlinkSync(modules);
    }
  }

  _symlinkModules() {
    const { outputPath } = this;
    const source = path.join(this.project.root, 'node_modules');
    const target = path.join(outputPath, 'node_modules');

    fs.mkdirsSync(outputPath);
    symlinkOrCopySync(source, target);
  }

  copyToOutputPath() {
    this._unsymlinkModules();
    super.copyToOutputPath(...arguments);
    this._symlinkModules();
  }

  cleanup() {
    this._unsymlinkModules();

    return super.cleanup();
  }
}

module.exports = SafeBuilder;
