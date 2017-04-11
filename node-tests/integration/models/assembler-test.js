'use strict';

const path = require('path');
const tmp = require('tmp');
const { copySync, readFileSync } = require('fs-extra');
const walkSync = require('walk-sync');
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

  function assemble(projectPath, { platform } = {}) {
    let { name: tmpRoot } = tmp.dirSync();
    let tmpDir = path.join(tmpRoot, 'project');
    copySync(projectPath, tmpDir);
    process.chdir(tmpDir);

    let ui = new MockUI();
    assembler = new Assembler({
      ui,
      project: new MockProject({ ui }),
      platform,
      emberBuildPath,
      outputPath: path.join(tmpRoot, 'output'),
    });

    return assembler.assemble();
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
        path.join('.compilerc'),
        path.join('ember-electron', 'electron-forge-config.js'),
        path.join('ember-electron', 'main.js'),
        path.join('ember', 'assets', 'app.css'),
        path.join('ember', 'assets', 'app.js'),
        path.join('ember', 'index.html'),
        path.join('package.json'),
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
});
