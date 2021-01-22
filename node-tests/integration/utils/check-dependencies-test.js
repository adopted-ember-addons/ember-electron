'use strict';

const mockElectronProject = require('../../helpers/mock-electron-project');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const { expect } = require('chai');
const { electronProjectPath } = require('../../../lib/utils/build-paths');
const checkDependencies = require('../../../lib/utils/check-dependencies');
const DependencyChecker = require('ember-cli-dependency-checker/lib/dependency-checker');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf').sync;

describe('checkDependencies()', function () {
  mockElectronProject();

  let project;
  let nodeModulesPath;

  beforeEach(function () {
    project = new MockProject();

    fs.writeFileSync(
      path.join(electronProjectPath, 'package.json'),
      JSON.stringify({
        dependencies: {
          'fake-package': '^1.0.0'
        }
      })
    );
    nodeModulesPath = path.join(electronProjectPath, 'node_modules');
    fs.mkdirSync(nodeModulesPath);
  });

  afterEach(function () {
    rimraf(nodeModulesPath);
  });

  it('works with correct dependencies', async function () {
    fs.mkdirSync(path.join(nodeModulesPath, 'fake-package'));
    fs.writeFileSync(
      path.join(nodeModulesPath, 'fake-package', 'package.json'),
      JSON.stringify({
        name: 'fake-package',
        version: '1.0.2'
      })
    );
    await expect(checkDependencies(project)).to.be.fulfilled;
  });

  it('works with missing dependencies', async function () {
    await expect(checkDependencies(project)).to.be.rejected;
  });

  it('works when ember-cli has already run the dependency checker', async function () {
    DependencyChecker.setAlreadyChecked(true);
    await expect(checkDependencies(project)).to.be.rejected;
  });
});
