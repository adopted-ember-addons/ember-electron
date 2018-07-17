'use strict';

const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');
const Task = require('ember-cli/lib/models/task');
const TestTaskMixin = require('../../../lib/utils/test-task-mixin');

class TestTask extends Task {
  run(options) {
    return options;
  }
}

const EETestTask = TestTask.extend(TestTaskMixin);

describe('test task mixin', () => {
  function subject(props) {
    return new EETestTask(Object.assign({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-with-test-config'),
    }, props));
  }

  it('sets configFile in the run options (if not defined)', () => {
    console.log(subject().run({}));
    expect(subject().run({}).configFile).to.equal('testem-electron.js');
  });
});
