'use strict';

const ElectronCommand = require('../../../lib/commands/electron');
const DependencyChecker = require('ember-cli-dependency-checker/lib/dependency-checker');
const mockElectronProject = require('../../helpers/mock-electron-project');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const MockProcess = require('ember-cli/tests/helpers/mock-process');
const willInterruptProcess = require('ember-cli/lib/utilities/will-interrupt-process');
const { api } = require('../../../lib/utils/forge-core');
const { expect } = require('chai');
const Builder = require('ember-cli/lib/models/builder');
const Watcher = require('ember-cli/lib/models/watcher');
const ExpressServer = require('ember-cli/lib/tasks/server/express-server');
const EventEmitter = require('events');
const path = require('path');
const rimraf = require('rimraf');
const sinon = require('sinon');

class MockWatcher extends EventEmitter {
  constructor() {
    super(...arguments);
    this.currentBuild = {
      then: sinon.stub().callsFake((resolve) => resolve())
    };
  }
}

describe('electron command', function() {
  mockElectronProject();

  let processArgv;

  let command;

  let mockBrocBuilder;
  let mockBrocWatcher;
  let mockProcess;

  let createBuilderStub;
  let cleanupBuilderStub;
  let createWatcherStub;
  let startServerStub;

  let emitExitStub;

  beforeEach(function() {
    processArgv = Array.from(process.argv);

    mockBrocBuilder = {};
    mockBrocWatcher = new MockWatcher();
    mockProcess = new MockProcess();

    emitExitStub = sinon.stub();

    createBuilderStub = sinon.stub(Builder.prototype, 'setupBroccoliBuilder').callsFake(function() {
      this.builder = mockBrocBuilder;
    });
    sinon.stub(Builder.prototype, 'build').resolves();
    cleanupBuilderStub = sinon.stub(Builder.prototype, 'cleanup').resolves();
    createWatcherStub = sinon.stub(Watcher.prototype, 'constructBroccoliWatcher').returns(mockBrocWatcher);
    startServerStub = sinon.stub(ExpressServer.prototype, 'start').resolves();
    sinon.stub(api, 'start').callsFake(() => {
      // make electron process exit right after start promise resolves
      setTimeout(() => {
        // We call this so we can use sinon's calledAfter() to make sure the
        // builder's cleanup call came after we emitted the exit event
        emitExitStub();
        mockProcess.emit('exit')
      }, 1);
      return Promise.resolve(mockProcess);
    });
    
    command = new ElectronCommand({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject(),
      tasks: {},
    });

    // This needs to be initialized when we create Builder instances or it
    // throws an error
    willInterruptProcess.capture(mockProcess);
  });

  afterEach(function() {
    process.argv = processArgv;
    willInterruptProcess.release();
  });
 
  it('works', async function() {
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(createBuilderStub).to.be.calledOnce;
    expect(createWatcherStub).to.be.calledOnce;
    expect(mockBrocWatcher.currentBuild.then).to.be.calledOnce;
    expect(startServerStub).to.be.calledOnce;
    expect(api.start).to.be.calledOnce;
    expect(api.start.firstCall).be.calledAfter(mockBrocWatcher.currentBuild.then.firstCall);
    expect(api.start.firstCall).be.calledAfter(startServerStub.firstCall);
    expect(cleanupBuilderStub).be.calledOnce;
    expect(cleanupBuilderStub.firstCall).be.calledAfter(emitExitStub.firstCall);
  });

  it('runs the dependency checker', async function() {
    sinon.spy(DependencyChecker.prototype, 'checkDependencies');
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(DependencyChecker.prototype.checkDependencies).to.be.calledOnce;
  });

  it('passes the correct path to electron-forge', async function() {
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(api.start).to.be.calledOnce;
    expect(api.start.firstCall.args[0].dir).to.equal(path.resolve('electron-app'));
  })

  it('sets the build output path and environment', async function() {
    let outputPath;
    let environment;
    createBuilderStub.resetBehavior();
    createBuilderStub.callsFake(function() {
      // pull values off of builder
      outputPath = this.outputPath;
      environment = this.environment;
    });

    await expect(command.validateAndRun([
      '--environment', 'testing'
    ])).to.be.fulfilled;
    expect(outputPath).to.equal(path.join('electron-app', 'ember-dist'));
    expect(environment).to.equal('testing');
  });

  it('sets up the live reload server with defaults', async function() {
    // default watcher varies from system to system depending on if watchman is
    // installed, so we'll set it so it's deterministic in the test
    await expect(command.validateAndRun([ '--watcher', 'node' ])).to.be.fulfilled;
    expect(startServerStub).to.be.calledOnce;

    let port = startServerStub.firstCall.args[0].liveReloadPort;
    expect(port).to.be.ok;

    expect(startServerStub.firstCall.args[0]).to.deep.equal({
      watcher: 'node',
      environment: 'development',
      liveReload: true,
      liveReloadHost: 'localhost',
      liveReloadPort: port,
      liveReloadPrefix: '_lr',
      port,
      liveReloadBaseUrl: `http://localhost:${port}/`,
      liveReloadJsUrl: `http://localhost:${port}/_lr/livereload.js?port=${port}&host=localhost&path=_lr/livereload`
    });
  });

  it('sets up the live reload server with custom options', async function() {
    // default watcher varies from system to system depending on if watchman is
    // installed, so we'll set it so it's deterministic in the test
    await expect(command.validateAndRun([
      '--watcher', 'node',
      '--live-reload-host', '127.0.0.1',
      '--live-reload-port', '12345',
      '--live-reload-prefix', 'lrlrlr'
    ])).to.be.fulfilled;
    expect(startServerStub).to.be.calledOnce;
    expect(startServerStub.firstCall.args[0]).to.deep.equal({
      watcher: 'node',
      environment: 'development',
      liveReload: true,
      liveReloadHost: '127.0.0.1',
      liveReloadPort: 12345,
      liveReloadPrefix: 'lrlrlr',
      port: 12345,
      liveReloadBaseUrl: `http://127.0.0.1:12345/`,
      liveReloadJsUrl: `http://127.0.0.1:12345/lrlrlr/livereload.js?port=12345&host=127.0.0.1&path=lrlrlr/livereload`
    });
  });

  it('can disable live reload', async function() {
    await expect(command.validateAndRun(['--live-reload', 'false' ])).to.be.fulfilled;
    expect(startServerStub).to.be.calledOnce;

    expect(startServerStub.firstCall.args[0].liveReload).to.not.be.ok;
    expect(startServerStub.firstCall.args[0].port).to.equal(0);
  });

  it('should pass an empty args through if no --- is found', async function() {
    process.argv = [ 'node', 'ember', 'electron' ];

    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(api.start).to.be.calledOnce;
    expect(api.start.firstCall.args[0].args).to.deep.equal([]);
  });

  it('should pass an args through if --- is found', async function() {
    process.argv = [ 'node', 'ember', 'electron', '---', 'arg1', '--arg2', '--arg3=value' ];

    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(api.start).to.be.calledOnce;
    expect(api.start.firstCall.args[0].args).to.deep.equal(['arg1', '--arg2', '--arg3=value']);
  });

  it('errors if the electron project directory is not present', async function() {
    rimraf.sync('electron-app');
    await expect(command.validateAndRun([])).to.be.rejected;
  });
});
