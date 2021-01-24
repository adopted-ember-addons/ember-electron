'use strict';

const mockElectronProject = require('../../helpers/mock-electron-project');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const { expect } = require('chai');
const EmberBuildCommand = require('ember-cli/lib/commands/build');
const BuildCommand = require('../../../lib/commands/build');
const DependencyChecker = require('ember-cli-dependency-checker/lib/dependency-checker');
const path = require('path');
const sinon = require('sinon');

describe('electron:build command', function () {
  mockElectronProject();

  let baseRunStub;
  let command;

  beforeEach(function () {
    baseRunStub = sinon.stub(EmberBuildCommand.prototype, 'run').resolves();
    command = new BuildCommand({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject(),
      tasks: {},
    });
  });

  it('calls the build command with EMBER_CLI_ELECTRON set', async function () {
    let envVal;
    baseRunStub.resetBehavior();
    baseRunStub.callsFake(() => {
      envVal = process.env.EMBER_CLI_ELECTRON;
      return Promise.resolve();
    });

    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(baseRunStub).to.be.calledOnce;
    expect(envVal).to.be.ok;
  });

  it('runs the dependency checker', async function () {
    sinon.spy(DependencyChecker.prototype, 'checkDependencies');
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(DependencyChecker.prototype.checkDependencies).to.be.calledOnce;
  });

  it('sets the default for outputPath', async function () {
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(baseRunStub).to.be.calledOnce;
    expect(baseRunStub.firstCall.args[0].outputPath).to.equal(
      path.join('electron-app', 'ember-dist')
    );
  });

  it('forwards options', async function () {
    await expect(
      command.validateAndRun([
        '--output-path',
        'some-dir',
        '--environment',
        'testing',
        '--watch',
        '--watcher',
        'polling',
        '--suppress-sizes',
      ])
    ).to.be.fulfilled;
    expect(baseRunStub).to.be.calledOnce;
    expect(baseRunStub.firstCall.args[0]).to.deep.equal({
      outputPath: path.resolve('some-dir'),
      environment: 'testing',
      watch: true,
      watcher: 'polling',
      suppressSizes: true,
    });
  });
});
