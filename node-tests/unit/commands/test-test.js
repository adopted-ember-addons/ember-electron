'use strict';

const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');
const TestCommand = require('../../../lib/commands/test');

describe('electron:test command', () => {
  let command;

  beforeEach(() => {
    command = new TestCommand({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-with-test-config'),
      tasks: {},
    });
  });

  it('uses the correct models and tasks', () => {
    expect(command.Builder).to.equal(require('../../../lib/models/builder'));
    expect(command.tasks.Build).to.equal(require('../../../lib/tasks/build-for-test'));
    expect(command.tasks.Test).to.equal(require('../../../lib/tasks/test'));
    expect(command.tasks.TestServer).to.equal(require('../../../lib/tasks/test-server'));
  });
});
