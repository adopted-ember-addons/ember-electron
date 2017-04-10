'use strict';

const mockery = require('mockery');
const MockElectronForgeStart = require('../../helpers/mocks/ef-start');
const RSVP = require('rsvp');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');

describe('electron command', () => {
  let CommandUnderTest, commandOptions, mockElectronForgeStart;

  before(() => {
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false,
    });
  });

  after(() => {
    mockery.disable();
  });

  beforeEach(() => {
    mockElectronForgeStart = new MockElectronForgeStart();
    mockery.registerMock('electron-forge/dist/api/start', mockElectronForgeStart);

    const cmd = require('../../../lib/commands/electron');
    CommandUnderTest = cmd.extend();

    commandOptions = {
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-empty'),
    };
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
  });

  it('should build the project before running Electron', () => {
    const tasks = [];

    commandOptions._buildAndWatch = () => {
      tasks.push('_buildAndWatch');

      return RSVP.resolve();
    };

    commandOptions._startElectron = () => {
      tasks.push('_startElectron');

      return RSVP.resolve();
    };

    const command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled.then(() => {
      expect(tasks).to.deep.equal(['_buildAndWatch', '_startElectron']);
    });
  });

  it('should not run Electron when the build fails', () => {
    const tasks = [];

    commandOptions._buildAndWatch = () => {
      tasks.push('_buildAndWatch');

      return RSVP.reject();
    };

    commandOptions._startElectron = () => {
      tasks.push('_startElectron');

      return RSVP.resolve();
    };

    const command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.rejected.then(() => {
      expect(tasks).to.deep.equal(['_buildAndWatch']);
    });
  });

  it('should not keep watching if Electron fails to run', () => {
    const tasks = [];

    commandOptions._buildAndWatch = () => {
      tasks.push('_buildAndWatch');

      return RSVP.resolve();
    };

    commandOptions._startElectron = () => {
      tasks.push('_startElectron');

      return RSVP.reject();
    };

    const command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.rejected.then(() => {
      expect(tasks).to.deep.equal(['_buildAndWatch', '_startElectron']);
    });
  });

  it('should try to start `electron-forge` process', () => {
    commandOptions._buildAndWatch = () => {
      return RSVP.resolve();
    };

    const command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled.then(() => {
      expect(mockElectronForgeStart.calls.length).to.equal(1);
    });
  });
});
