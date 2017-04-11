'use strict';

const mockery = require('mockery');
const { resolve, reject } = require('rsvp');
const { clone } = require('lodash/lang');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');

describe('BuildTask', () => {
  let operations;
  let builderOptions;
  let failBuild;
  let BuildTask;

  class MockBuilder {
    constructor(options) {
      builderOptions = clone(options);
    }

    build() {
      operations.push('build');

      return failBuild ? reject() : resolve();
    }

    cleanup() {
      operations.push('cleanup');

      return resolve;
    }
  }

  function subject(props) {
    return new BuildTask(Object.assign({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-with-test-config'),
    }, props));
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
    builderOptions = null;
    operations = [];
    failBuild = false;

    mockery.registerMock('../models/builder', MockBuilder);
    BuildTask = require('../../../lib/tasks/build');
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
  });

  it('builds with default options', () => {
    let task = subject();

    return task.run({ outputPath: 'output' }).then(() => {
      expect(builderOptions.ui).to.equal(task.ui);
      expect(builderOptions.project).to.equal(task.project);
      expect(builderOptions.outputPath).to.equal('output');
      expect(builderOptions.environment).to.be.undefined;
      expect(builderOptions.assemble).to.be.undefined;
      expect(builderOptions.platform).to.be.undefined;

      expect(operations).to.deep.equal(['build', 'cleanup']);
    });
  });

  it('builds with non-default options', () => {
    let task = subject();

    return task.run({
      outputPath: 'output',
      environment: 'test',
      assemble: true,
      platform: 'win32',
    }).then(() => {
      expect(builderOptions.ui).to.equal(task.ui);
      expect(builderOptions.project).to.equal(task.project);
      expect(builderOptions.outputPath).to.equal('output');
      expect(builderOptions.environment).to.equal('test');
      expect(builderOptions.assemble).to.be.true;
      expect(builderOptions.platform).to.equal('win32');

      expect(operations).to.deep.equal(['build', 'cleanup']);
    });
  });

  it('fails when the builder fails', () => {
    failBuild = true;
    let task = subject();

    return expect(task.run({ outputPath: 'output' })).to.be.rejected.then(() => {
      expect(operations).to.deep.equal(['build', 'cleanup']);
    });
  });
});
