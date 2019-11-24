'use strict';

const mockElectronProject = require('../../helpers/mock-electron-project');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const { expect } = require('chai');
const BuildTask = require('ember-cli/lib/tasks/build');
const MakeCommand = require('../../../lib/commands/make');
const MakeTask = require('../../../lib/tasks/make');
const { api } = require('@electron-forge/core');
const rimraf = require('rimraf');
const path = require('path');
const sinon = require('sinon');

describe('electron:make command', function() {
  mockElectronProject();

  let buildTaskStub;
  let command;

  beforeEach(function() {
    buildTaskStub = sinon.stub(BuildTask.prototype, 'run').resolves();
    sinon.stub(api, 'make').resolves();

    command = new MakeCommand({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject(),
      tasks: {
        'Build': BuildTask,
        'ElectronMake': MakeTask
      },
    });
  });

  it('works', async function() {
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(buildTaskStub).to.be.calledOnce;
    expect(buildTaskStub.firstCall.args[0].outputPath).to.equal(path.join('electron-app', 'ember-dist'));
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: 'electron-app',
      outDir: path.join('electron-app', 'out'),
      skipPackage: false
    });
    expect(api.make.firstCall).to.be.calledAfter(buildTaskStub.firstCall);
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

  it('can skip building', async function() {
    await expect(command.validateAndRun([ '--skip-build' ])).to.be.fulfilled;
    expect(buildTaskStub).to.not.be.called;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: 'electron-app',
      outDir: path.join('electron-app', 'out'),
      skipPackage: false
    });
  });

  it('can skip packaging (which also skips building)', async function() {
    await expect(command.validateAndRun([ '--skip-package' ])).to.be.fulfilled;
    expect(buildTaskStub).to.not.be.called;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: 'electron-app',
      outDir: path.join('electron-app', 'out'),
      skipPackage: true
    });
  });

  it('can skip building and packaging explicitly', async function() {
    await expect(command.validateAndRun([ '--skip-package' ])).to.be.fulfilled;
    expect(buildTaskStub).to.not.be.called;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: 'electron-app',
      outDir: path.join('electron-app', 'out'),
      skipPackage: true
    });
  });

  it('can set the platform, arch, and output path', async function() {
    await expect(command.validateAndRun([
      '--platform', 'linux',
      '--arch', 'ia32',
      '--output-path', 'some-dir'
    ])).to.be.fulfilled;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: 'electron-app',
      outDir: path.resolve('some-dir'),
      platform: 'linux',
      arch: 'ia32',
      skipPackage: false
    });
  });

  it('can set one override target', async function() {
    await expect(command.validateAndRun([ '--targets', 'zip' ])).to.be.fulfilled;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: 'electron-app',
      outDir: path.join('electron-app', 'out'),
      skipPackage: false,
      overrideTargets: [ 'zip' ]
    });
  });

  it('can set multiple override targets', async function() {
    await expect(command.validateAndRun([ '--targets', 'zip,dmg,deb' ])).to.be.fulfilled;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: 'electron-app',
      outDir: path.join('electron-app', 'out'),
      skipPackage: false,
      overrideTargets: [ 'zip', 'dmg', 'deb' ]
    });
  });

  it('errors if the electron project directory is not present', async function() {
    rimraf.sync('electron-app');
    await expect(command.validateAndRun([])).to.be.rejected;
  });
});
