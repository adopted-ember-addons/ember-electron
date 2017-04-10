'use strict';

const mockery = require('mockery');
const MockElectronForgePackage = require('../../helpers/mocks/ef-package');
const RSVP = require('rsvp');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');

describe('electron:package command', () => {
  let CommandUnderTest, commandOptions, mockElectronForgePackage;

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
    mockElectronForgePackage = new MockElectronForgePackage();
    mockery.registerMock('electron-forge/dist/api/package', mockElectronForgePackage);

    const cmd = require('../../../lib/commands/package');
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

  it('should build the project before starting to package', () => {
    const tasks = [];

    commandOptions.prepareBuild = () => {
      tasks.push('prepareBuild');

      return RSVP.resolve();
    };

    commandOptions.builder = () => {
      tasks.push('builder');

      return RSVP.resolve();
    };

    const command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled.then(() => {
      expect(tasks).to.deep.equal(['prepareBuild', 'builder']);
    });
  });
});
