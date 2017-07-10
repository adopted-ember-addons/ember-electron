'use strict';

const path = require('path');
const tmp = require('tmp');
const {
  copySync,
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
} = require('fs-extra');
const walkSync = require('walk-sync');
const symlinkOrCopySync = require('symlink-or-copy').sync;
const MockUI = require('console-ui/mock');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');
const Assembler = require('../../../lib/models/assembler');

describe('Assembler model', () => {
  let cwd;
  let env;
  let assembler;

  function fixturePath(name) {
    return path.resolve(__dirname, '..', '..', 'fixtures', name);
  }

  const emberBuildPath = fixturePath('ember-build');
  const pkg = {
    config: {
      forge: 'ember-electron/electron-forge-config.js',
    },
  };

  function assembleInto(outputPath, { platform } = {}) {
    let ui = new MockUI();
    assembler = new Assembler({
      ui,
      project: new MockProject({ ui, pkg }),
      platform,
      emberBuildPath,
      outputPath,
    });

    return assembler.assemble();
  }

  function assemble(projectPath, options) {
    let { name: tmpRoot } = tmp.dirSync();
    let tmpDir = path.join(tmpRoot, 'project');
    copySync(projectPath, tmpDir);
    process.chdir(tmpDir);

    return assembleInto(path.join(tmpRoot, 'output'), options);
  }

  beforeEach(() => {
    cwd = process.cwd();
    env = process.env;
    process.env = {};
  });

  afterEach(() => {
    if (assembler) {
      return assembler.cleanup();
    }
    process.env = env;
    process.chdir(cwd);
  });

  it('assembles', () => {
    return assemble(fixturePath('project-simple')).then(({ directory }) => {
      let files = walkSync(directory, { directories: false });
      expect(files).to.deep.equal([
        '.compilerc',
        'ember-electron/electron-forge-config.js',
        'ember-electron/main.js',
        'ember/assets/app.css',
        'ember/assets/app.js',
        'ember/index.html',
        'package.json',
      ]);
    });
  });

  it('defaults to the current platform', () => {
    return assemble(fixturePath('project-resources')).then(({ directory }) => {
      let filePath = path.join(directory, 'ember-electron', 'resources', 'platform.txt');
      expect(readFileSync(filePath).toString().trim()).to.equal(process.platform);
    });
  });

  it('respects the specified platform', () => {
    let platform = process.platform === 'darwin' ? 'win32' : 'darwin';

    return assemble(fixturePath('project-resources'), { platform }).then(({ directory }) => {
      let filePath = path.join(directory, 'ember-electron', 'resources', 'platform.txt');
      expect(readFileSync(filePath).toString().trim()).to.equal(platform);
    });
  });

  it('removes node_modules directory from the output directory before syncing', () => {
    return assemble(fixturePath('project-resources')).then(({ directory }) => {
      let nodeModulesPath = path.join(directory, 'node_modules');
      mkdirSync(nodeModulesPath);
      writeFileSync(path.join(nodeModulesPath, 'foo'), 'blah');

      return assembleInto(directory);
    }).then(({ directory }) => {
      expect(existsSync(path.join(directory, 'node_modules'))).to.be.false;
    });
  });

  it('removes node_modules symlink from the output directory before syncing', () => {
    // Create a directory that we can make the target of the node_modules
    // symlink so we can make sure syncing doesn't follow the symlink and delete
    // the contents.
    let { name: tmpDir } = tmp.dirSync();
    let modulePath = path.join(tmpDir, 'some-module');
    let filePath = path.join(modulePath, 'package.json');
    mkdirSync(modulePath);
    writeFileSync(filePath, '{}');

    return assemble(fixturePath('project-resources')).then(({ directory }) => {
      symlinkOrCopySync(tmpDir, path.join(directory, 'node_modules'));

      return assembleInto(directory);
    }).then(({ directory }) => {
      expect(existsSync(path.join(directory, 'node_modules'))).to.be.false;
      expect(existsSync(filePath)).to.be.true;
    });
  });
});
