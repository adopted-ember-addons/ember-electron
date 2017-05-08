'use strict';

const mockery = require('mockery');
const { clone } = require('lodash/lang');
const CoreObject = require('core-object');
const expect = require('../../helpers/expect');

describe('BuildForTestTask', () => {
  let BuildForTestTask;
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

    BuildForTestTask = require('../../../lib/tasks/build-for-test');
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
  });

  it('builds, assembles and symlinks node_modules', () => {
    let task = new BuildForTestTask();
    task.run({ platform: 'win32', outputPath: 'output' });
    expect(runOptions.platform).to.be.equal('win32');
    expect(runOptions.outputPath).to.be.equal('output');
    expect(runOptions.assemble).to.be.ok;
    expect(runOptions.symlinkNodeModules).to.be.ok;
  });
});
