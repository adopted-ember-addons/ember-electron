'use strict';

const mockery = require('mockery');
const RSVP = require('rsvp');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');

describe('build command (used by electron, electron:package, electron:make)', () => {
  let CommandUnderTest, commandOptions;

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
    const cmd = require('../../../lib/commands/build');
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

  it('should prepare the build before building - and cleanup after', () => {
    const tasks = [];

    commandOptions.prepareBuild = () => {
      tasks.push('prepareBuild');

      return RSVP.resolve();
    };

    commandOptions.builder = () => {
      tasks.push('builder');

      return RSVP.resolve();
    };

    commandOptions.cleanupBuild = () => {
      tasks.push('cleanupBuild');

      return RSVP.resolve();
    };

    const command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled.then(() => {
      expect(tasks).to.deep.equal(['prepareBuild', 'builder', 'cleanupBuild']);
    });
  });

  it('should install dependencies after building Ember app', () => {
    const tasks = [];

    commandOptions._buildApp = () => {
      tasks.push('_buildApp');

      return RSVP.resolve();
    };

    commandOptions.builder = () => Promise.resolve();

    commandOptions._installDependencies = () => {
      tasks.push('_installDependencies');

      return RSVP.resolve();
    };

    const command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled.then(() => {
      expect(tasks).to.deep.equal(['_buildApp', '_installDependencies']);
    });
  });

  it('should reject if no builder was added', () => {
    commandOptions.builder = null;
    const command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.rejectedWith('is missing its');
  });

  it('should pass options to the builder', () => {
    let builderArgs;

    commandOptions.builder = (args) => {
      builderArgs = args;

      return RSVP.resolve();
    };
    commandOptions.prepareBuild = () => RSVP.resolve();
    const command = new CommandUnderTest(commandOptions).validateAndRun();

    return expect(command).to.be.fulfilled.then(() => {
      expect(builderArgs).to.exist;
      expect(builderArgs.dir).to.exist;
      expect(builderArgs.dir).to.include('tmp/electron_livereload');
      expect(builderArgs.outDir).to.exist;
      expect(builderArgs.outDir).to.include('node-tests/fixtures/project-empty/electron-out');
    });
  });
});
