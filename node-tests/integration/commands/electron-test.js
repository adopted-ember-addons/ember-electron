'use strict';

const ElectronCommand = require('../../../lib/commands/electron');
const mockElectronProject = require('../../helpers/mock-electron-project');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const MockProcess = require('ember-cli/tests/helpers/mock-process');
const willInterruptProcess = require('ember-cli/lib/utilities/will-interrupt-process');
const { api } = require('@electron-forge/core');
const { expect } = require('chai');
const Builder = require('ember-cli/lib/models/builder');
const Watcher = require('ember-cli/lib/models/watcher');
const EventEmitter = require('events');
const path = require('path');
const rimraf = require('rimraf');
const sinon = require('sinon');

class MockWatcher extends EventEmitter {
  constructor() {
    super(...arguments);
    this.then = sinon.stub().callsFake((resolve) => resolve());
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
    createWatcherStub = sinon.stub(Watcher.prototype, 'constructWatcher').returns(mockBrocWatcher);
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
    expect(mockBrocWatcher.then).to.be.calledOnce;
    expect(api.start).to.be.calledOnce;
    expect(api.start.firstCall).be.calledAfter(mockBrocWatcher.then.firstCall);
    expect(cleanupBuilderStub).be.calledOnce;
    expect(cleanupBuilderStub.firstCall).be.calledAfter(emitExitStub.firstCall);
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
