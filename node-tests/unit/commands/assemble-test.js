'use strict';

const mockery = require('mockery');
const { resolve } = require('rsvp');
const { clone } = require('lodash/lang');
const CoreObject = require('core-object');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');

describe('electron:assemble command', () => {
  let assembleTaskOptions;
  let assembleRunOptions;

  let command;

  class MockAssembleTask extends CoreObject {
    constructor(options) {
      super(...arguments);
      assembleTaskOptions = clone(options);
    }

    run(options) {
      assembleRunOptions = clone(options);

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
    assembleTaskOptions = null;
    assembleRunOptions = null;

    mockery.registerMock('../tasks/assemble', MockAssembleTask);

    const AssembleCommand = require('../../../lib/commands/assemble');
    command = new AssembleCommand({
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

  it('should invoke the assemble command with the correct options', () => {
    let options = {
      outputPath: 'output',
    };

    return command.run(options).then(() => {
      expect(assembleTaskOptions.ui).to.equal(command.ui);
      expect(assembleTaskOptions.analytics).to.equal(command.analytics);
      expect(assembleTaskOptions.project).to.equal(command.project);

      expect(assembleRunOptions.outputPath).to.equal('output');
    });
  });
});
