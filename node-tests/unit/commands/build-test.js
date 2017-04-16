'use strict';

const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');
const BuildCommand = require('../../../lib/commands/build');

describe('electron:build command', () => {
  let command;

  beforeEach(() => {
    command = new BuildCommand({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-with-test-config'),
      tasks: {},
    });
  });

  it('uses the correct tasks', () => {
    expect(command.tasks.Build).to.equal(require('../../../lib/tasks/build'));
  });
});
