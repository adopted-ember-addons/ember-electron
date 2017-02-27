'use strict';

const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');
const ElectronTestCommand = require('../../../lib/commands/electron-test');

describe('ember electron:test command', () => {
  let env;
  let command;

  beforeEach(() => {
    env = process.env;
    process.env = {};
    command = new ElectronTestCommand({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-with-test-config'),
      tasks: {},
    });
  });

  afterEach(() => {
    process.env = env;
  });

  it('uses the correct tasks', () => {
    expect(command.tasks.Test).to.equal(require('../../../lib/tasks/electron-test'));
    expect(command.tasks.TestServer).to.equal(require('../../../lib/tasks/electron-test-server'));
  });

  it('sets EMBER_CLI_ELECTRON', () => {
    expect(process.env.EMBER_CLI_ELECTRON).to.be.true;
  });
});
