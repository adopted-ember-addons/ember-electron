'use strict';

const mockery = require('mockery');
const { clone } = require('lodash/lang');
const CoreObject = require('core-object');
const expect = require('../../helpers/expect');

describe('BuildAndAssembleTask', () => {
  let BuildAndAssembleTask;
  let runOptions;

  class MockBuildTask extends CoreObject {
    run(options) {
      runOptions = clone(options);
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
    mockery.registerMock('./build', MockBuildTask);

    BuildAndAssembleTask = require('../../../lib/tasks/build-and-assemble');
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
  });

  it('builds and assembles', () => {
    let task = new BuildAndAssembleTask();
    task.run({ platform: 'win32', outputPath: 'output' });
    expect(runOptions.platform).to.be.equal('win32');
    expect(runOptions.outputPath).to.be.equal('output');
    expect(runOptions.assemble).to.be.ok;
  });
});
