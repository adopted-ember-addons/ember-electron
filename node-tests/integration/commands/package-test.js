'use strict';

const mockElectronProject = require('../../helpers/mock-electron-project');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const { expect } = require('chai');
const BuildTask = require('ember-cli/lib/tasks/build');
const PackageCommand = require('../../../lib/commands/package');
const PackageTask = require('../../../lib/tasks/package');
const { api } = require('@electron-forge/core');
const path = require('path');
const rimraf = require('rimraf');
const sinon = require('sinon');

describe('electron:package command', function() {
  mockElectronProject();

  let buildTaskStub;
  let command;

  beforeEach(function() {
    buildTaskStub = sinon.stub(BuildTask.prototype, 'run').resolves();
    sinon.stub(api, 'package').resolves();

    command = new PackageCommand({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject(),
      tasks: {
        'Build': BuildTask,
        'ElectronPackage': PackageTask
      },
    });
  });

  it('works', async function() {
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(buildTaskStub).to.be.calledOnce;
    expect(buildTaskStub.firstCall.args[0].outputPath).to.equal(path.join('electron-app', 'ember-dist'));
    expect(api.package).to.be.calledOnce;
    expect(api.package.firstCall.args[0]).to.deep.equal({
      dir: 'electron-app',
      outDir: path.join('electron-app', 'out')
    });
    expect(api.package.firstCall).to.be.calledAfter(buildTaskStub.firstCall);
  });
  
  it('builds with EMBER_CLI_ELECTRON set', async function() {    
    let envVal;
    buildTaskStub.resetBehavior();
    buildTaskStub.callsFake(() => {
      envVal = process.env.EMBER_CLI_ELECTRON;
      return Promise.resolve();
    });

    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(envVal).to.be.ok;
  });

  it('builds for the correct environment', async function() {
    await expect(command.validateAndRun([ '--environment', 'testing' ])).to.be.fulfilled;
    expect(buildTaskStub).to.be.calledOnce;
    expect(buildTaskStub.firstCall.args[0].environment).to.equal('testing');
  });

  it('sets the platform, argch, and output path', async function() {
    await expect(command.validateAndRun([
      '--platform', 'linux',
      '--arch', 'ia32',
      '--output-path', 'some-dir'
    ])).to.be.fulfilled;
    expect(api.package).to.be.calledOnce;
    expect(api.package.firstCall.args[0]).to.deep.equal({
      dir: 'electron-app',
      outDir: path.resolve('some-dir'),
      platform: 'linux',
      arch: 'ia32'
    });
  });

  it('errors if the electron project directory is not present', async function() {
    rimraf.sync('electron-app');
    await expect(command.validateAndRun([])).to.be.rejected;
  });
});
