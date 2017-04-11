'use strict';

const mockery = require('mockery');
const { resolve } = require('rsvp');
const { clone } = require('lodash/lang');
const CoreObject = require('core-object');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');

describe('electron:make command', () => {
  let makeTaskOptions;
  let makeRunOptions;

  let command;

  class MockMakeTask extends CoreObject {
    constructor(options) {
      super(...arguments);
      makeTaskOptions = clone(options);
    }

    run(options) {
      makeRunOptions = clone(options);

      return resolve();
    }
  }

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
    makeTaskOptions = null;
    makeRunOptions = null;

    mockery.registerMock('../tasks/make', MockMakeTask);

    const MakeCommand = require('../../../lib/commands/make');
    command = new MakeCommand({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject(),
      tasks: {},
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
  });

  it('should invoke the make command with the correct options', () => {
    let options = {
      outputPath: 'output',
    };

    return command.run(options).then(() => {
      expect(makeTaskOptions.ui).to.equal(command.ui);
      expect(makeTaskOptions.analytics).to.equal(command.analytics);
      expect(makeTaskOptions.project).to.equal(command.project);

      expect(makeRunOptions.outputPath).to.equal('output');
    });
  });
});
