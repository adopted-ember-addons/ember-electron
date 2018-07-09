'use strict';

const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');
const TestTask = require('../../../lib/tasks/test');

describe('electron:test task', () => {
  function subject(props) {
    return new TestTask(Object.assign({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-with-test-config'),
    }, props));
  }

  it('uses a provided testem instance', () => {
    let testem = {};
    expect(subject({ testem }).testem).to.equal(testem);
  });

  it('creates a testem instance if none is provided', () => {
    expect(subject().testem).to.be.an.instanceof(require('testem'));
  });

  it('sets the file in the default testem options', () => {
    expect(subject().defaultOptions({}).file).to.equal('testem-electron.js');
  });
});
