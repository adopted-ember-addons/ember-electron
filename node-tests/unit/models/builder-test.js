'use strict';

const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const mockery = require('mockery');
const CoreObject = require('core-object');
const expect = require('../../helpers/expect');

describe('Builder model', () => {
  let env;
  let Builder;
  let outputPath;
  let project;

  class MockBuilder extends CoreObject {
    copyToOutputPath() {
      // There must never be a node_modules symlink in the output path when we
      // copy there, or the tree syncing will delete stuff it shouldn't
      expect(fs.existsSync(path.join(this.outputPath, 'node_modules'))).to.be.false;
      fs.writeFileSync(path.join(this.outputPath, 'build'), 'build');
    }

    cleanup() {
      // There should never be a node_modules symlink in the output path by the
      // time we are called or we screwed up our cleanup
      expect(fs.existsSync(path.join(this.outputPath, 'node_modules'))).to.be.false;
      fs.unlinkSync(path.join(this.outputPath, 'build'));
    }
  }

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false,
    });
  });

  after(() => {
    mockery.disable();
  });

  beforeEach(() => {
    env = process.env;
    process.env = {};

    mockery.registerMock('ember-cli/lib/models/builder', MockBuilder);

    Builder = require('../../../lib/models/builder');

    // Create output path
    ({ name: outputPath } = tmp.dirSync());

    // Create project root with node_modules lib
    project = { root: tmp.dirSync().name };
    let nodeModules = path.join(project.root, 'node_modules');
    fs.mkdirSync(nodeModules);
    fs.writeFileSync(path.join(nodeModules, 'lib'), 'lib');
  });

  afterEach(() => {
    // Nothing should ever delete our lib file
    expect(fs.existsSync(path.join(project.root, 'node_modules', 'lib'))).to.be.ok;

    process.env = env;

    mockery.deregisterAll();
    mockery.resetCache();
  });

  it('is a builder', () => {
    let builder = new Builder({});
    expect(builder).to.be.an.instanceOf(MockBuilder);
  });

  it('sets the right environment variables when not assembling', () => {
    new Builder({});
    expect(process.env.EMBER_CLI_ELECTRON).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_ASSEMBLE).to.not.be.ok;
  });

  it('sets the right environment variables when assembling', () => {
    new Builder({ assemble: true });
    expect(process.env.EMBER_CLI_ELECTRON).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_ASSEMBLE).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_PLATFORM).to.equal(process.platform);
  });

  it('respects the specified platform when assembling', () => {
    let platform = process.platform === 'darwin' ? 'linux' : 'darwin';

    new Builder({ assemble: true, platform });
    expect(process.env.EMBER_CLI_ELECTRON).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_ASSEMBLE).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_PLATFORM).to.equal(platform);
  });

  describe('copyToOutputPath', () => {
    it('works', () => {
      let builder = new Builder({ project, outputPath });
      builder.copyToOutputPath();
      expect(fs.existsSync(path.join(outputPath, 'build'))).to.be.ok;
    });

    it('doesn\'t symlink node_modules if the option is not set', () => {
      let builder = new Builder({ project, outputPath });
      builder.copyToOutputPath();
      expect(fs.existsSync(path.join(outputPath, 'node_modules'))).to.not.be.ok;
    });

    it('symlinks node_modules if the option is set', () => {
      let builder = new Builder({ project, outputPath, symlinkNodeModules: true });
      builder.copyToOutputPath();
      expect(fs.existsSync(path.join(outputPath, 'node_modules'))).to.be.ok;
    });

    it('manages the node_modules symlink across multiple calls', () => {
      let builder = new Builder({ project, outputPath, symlinkNodeModules: true });
      builder.copyToOutputPath();
      builder.copyToOutputPath();
      expect(fs.existsSync(path.join(outputPath, 'node_modules'))).to.be.ok;
    });

    it('manages the node_modules symlink across multiple calls with symlinkNodeModules changing', () => {
      let builder = new Builder({ project, outputPath, symlinkNodeModules: true });
      builder.copyToOutputPath();
      builder = new Builder({ project, outputPath });
      builder.copyToOutputPath();
      expect(fs.existsSync(path.join(outputPath, 'node_modules'))).to.not.be.ok;
      expect(fs.existsSync(path.join(project.root, 'node_modules'))).to.be.ok;
    });
  });
});
