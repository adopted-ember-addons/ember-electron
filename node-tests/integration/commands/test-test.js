'use strict';

const mockElectronProject = require('../../helpers/mock-electron-project');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const { expect } = require('chai');
const EmberTestCommand = require('ember-cli/lib/commands/test');
const TestCommand = require('../../../lib/commands/test');
const DependencyChecker = require('ember-cli-dependency-checker/lib/dependency-checker');
const path = require('path');
const sinon = require('sinon');

describe('electron:test command', function () {
  mockElectronProject();

  let baseRunStub;
  let command;

  beforeEach(function () {
    baseRunStub = sinon.stub(EmberTestCommand.prototype, 'run').resolves();
    command = new TestCommand({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject(),
      tasks: {}
    });
  });

  it('calls the test command with EMBER_CLI_ELECTRON set', async function () {
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

  it('sets the default for outputPath and configFile', async function () {
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(baseRunStub).to.be.calledOnce;
    expect(baseRunStub.firstCall.args[0].outputPath).to.equal(
      path.join('electron-app', 'ember-test')
    );
    expect(baseRunStub.firstCall.args[0].configFile).to.equal(
      'testem-electron.js'
    );
  });

  it('it forwards options', async function () {
    await expect(command.validateAndRun(['--environment', 'testing', '-s'])).to
      .be.fulfilled;
    expect(baseRunStub).to.be.calledOnce;
    expect(baseRunStub.firstCall.args[0].environment).to.equal('testing');
    expect(baseRunStub.firstCall.args[0].server).to.be.true;
  });
});
