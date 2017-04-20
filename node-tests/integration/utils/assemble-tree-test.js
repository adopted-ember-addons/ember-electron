'use strict';

const path = require('path');
const tmp = require('tmp');
const { copySync, readFileSync } = require('fs-extra');
const walkSync = require('walk-sync');
const MockUI = require('console-ui/mock');
const expect = require('../../helpers/expect');
const { Builder } = require('broccoli-builder');
const Funnel = require('broccoli-funnel');
const assembleTree = require('../../../lib/utils/assemble-tree');

describe('assembleTree', () => {
  let cwd;
  let env;
  let ui;
  let builder;

  function fixturePath(name) {
    return path.resolve(__dirname, '..', '..', 'fixtures', name);
  }

  function defaultPkg() {
    return {
      config: {
        forge: 'ember-electron/electron-forge-config.js',
      },
    };
  }

  const emberBuildPath = fixturePath('ember-build');

  function buildTree(projectPath, { inputNode, platform, pkg = defaultPkg() }) {
    let { name: tmpRoot } = tmp.dirSync();
    let tmpDir = path.join(tmpRoot, 'project');
    copySync(projectPath, tmpDir);
    process.chdir(tmpDir);

    let tree = assembleTree({ ui, project: { pkg }, platform, inputNode });
    builder = new Builder(tree);

    return builder.build();
  }

  beforeEach(() => {
    cwd = process.cwd();
    env = process.env;
    process.env = {};
    ui = new MockUI();
  });

  afterEach(() => {
    if (builder) {
      return builder.cleanup();
    }
    process.env = env;
    process.chdir(cwd);
  });

  it('builds from a directory', () => {
    let projectPath = fixturePath('project-simple');
    let inputNode = emberBuildPath;

    return buildTree(projectPath, { inputNode }).then(({ directory }) => {
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

  it('builds from a broccoli tree', () => {
    let projectPath = fixturePath('project-simple');
    let inputNode = new Funnel(emberBuildPath);

    return buildTree(projectPath, { inputNode }).then(({ directory }) => {
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

  it('collates resources directories', () => {
    let projectPath = fixturePath('project-resources');
    let inputNode = emberBuildPath;

    return buildTree(projectPath, { inputNode, platform: 'win32' }).then(({ directory }) => {
      let files = walkSync(directory, { directories: false });
      expect(files).to.deep.equal([
        path.join('.compilerc'),
        path.join('ember-electron', 'electron-forge-config.js'),
        path.join('ember-electron', 'main.js'),
        path.join('ember-electron', 'resources', 'platform.txt'),
        path.join('ember-electron', 'resources', 'resource.txt'),
        path.join('ember-electron', 'resources', 'win32.txt'),
        path.join('ember', 'assets', 'app.css'),
        path.join('ember', 'assets', 'app.js'),
        path.join('ember', 'index.html'),
        path.join('package.json'),
      ]);

      let filePath = path.join(directory, 'ember-electron', 'resources', 'platform.txt');
      expect(readFileSync(filePath).toString().trim()).to.equal('win32');
    });
  });

  it('collates resources directories on darwin', () => {
    let projectPath = fixturePath('project-resources');
    let inputNode = new Funnel(emberBuildPath);

    return buildTree(projectPath, { inputNode, platform: 'darwin' }).then(({ directory }) => {
      let filePath = path.join(directory, 'ember-electron', 'resources', 'platform.txt');
      expect(readFileSync(filePath).toString().trim()).to.equal('darwin');
    });
  });

  it('collates resources directories on linux', () => {
    let projectPath = fixturePath('project-resources');
    let inputNode = new Funnel(emberBuildPath);

    return buildTree(projectPath, { inputNode, platform: 'linux' }).then(({ directory }) => {
      let filePath = path.join(directory, 'ember-electron', 'resources', 'platform.txt');
      expect(readFileSync(filePath).toString().trim()).to.equal('linux');
    });
  });

  it('uses the correct main.js when EMBER_ENV is not "test"', () => {
    let projectPath = fixturePath('project-simple');
    let inputNode = emberBuildPath;
    process.env.EMBER_ENV = 'production';

    return buildTree(projectPath, { inputNode }).then(({ directory }) => {
      let mainPath = path.join(directory, 'ember-electron', 'main.js');
      expect(readFileSync(mainPath).toString().trim()).to.be.equal('// main.js');
    });
  });

  it('uses the correct main.js when EMBER_ENV is "test"', () => {
    let projectPath = fixturePath('project-simple');
    let inputNode = emberBuildPath;
    process.env.EMBER_ENV = 'test';

    return buildTree(projectPath, { inputNode }).then(({ directory }) => {
      let mainPath = path.join(directory, 'ember-electron', 'main.js');
      expect(readFileSync(mainPath).toString().trim()).to.be.equal('// tests/main.js');
    });
  });

  it('warns when ember-welcome-page is installed', () => {
    let projectPath = fixturePath('project-simple');
    let inputNode = emberBuildPath;
    let pkg = defaultPkg();
    pkg.devDependencies = { 'ember-welcome-page': '^1.0.0' };

    return buildTree(projectPath, { inputNode, pkg }).then(() => {
      expect(ui.output).to.contain('ember-welcome-page');
    });
  });

  it('doesn\'t warn when ember-welcome-page is not installed', () => {
    let projectPath = fixturePath('project-simple');
    let inputNode = emberBuildPath;

    return buildTree(projectPath, { inputNode }).then(() => {
      expect(ui.output).to.not.contain('ember-welcome-page');
    });
  });

  it('fills in a default when package.json has no "main" entry', () => {
    let projectPath = fixturePath('project-simple');
    let inputNode = emberBuildPath;

    return buildTree(projectPath, { inputNode }).then(({ directory }) => {
      let packageJson = require(`${directory}/package.json`);
      expect(packageJson.main).to.equal('ember-electron/main.js');
    });
  });

  it('throws an error when ember-electron/main.js does not exist', () => {
    let projectPath = fixturePath('project-missing-main');
    let inputNode = emberBuildPath;

    expect(() => buildTree(projectPath, { inputNode })).to.throw(/main module/);
  });

  it('throws an error when package.json has no forge config', () => {
    let projectPath = fixturePath('project-simple');
    let inputNode = emberBuildPath;

    expect(() => buildTree(projectPath, { inputNode, pkg: {} })).to.throw(/config\.forge/);
    expect(() => buildTree(projectPath, { inputNode, pkg: { config: {} } })).to.throw(/config\.forge/);
  });

});
