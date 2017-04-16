'use strict';

const mockery = require('mockery');
const { resolve, reject } = require('rsvp');
const { clone } = require('lodash/lang');
const CoreObject = require('core-object');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');

describe('MakeTask', () => {
  let operations;

  let packageTaskOptions;
  let packageRunOptions;
  let packageFail;

  let forgeMakeOptions;
  let forgeMakeFail;

  let task;

  class MockPackageTask extends CoreObject {
    constructor(options) {
      super(...arguments);
      packageTaskOptions = clone(options);
    }

    run(options) {
      operations.push('package');
      packageRunOptions = clone(options);

      return packageFail ? reject() : resolve();
    }
  }

  function mockForgeMake(options) {
    operations.push('forgeMake');
    forgeMakeOptions = clone(options);

    return forgeMakeFail ? reject() : resolve();
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
    operations = [];
    packageTaskOptions = null;
    packageRunOptions = null;
    packageFail = false;
    forgeMakeOptions = null;
    forgeMakeFail = false;

    mockery.registerMock('./package', MockPackageTask);
    mockery.registerMock('electron-forge/dist/api/make', { default: mockForgeMake });

    const MakeTask = require('../../../lib/tasks/make');
    task = new MakeTask({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      project: new MockProject(),
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
  });

  it('should package and make when no input path or skipPackage is specified', () => {
    let options = {
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['package', 'forgeMake']);

      expect(packageTaskOptions.ui).to.equal(task.ui);
      expect(packageTaskOptions.analytics).to.equal(task.analytics);
      expect(packageTaskOptions.project).to.equal(task.project);

      expect(packageRunOptions.outputPath).to.equal('output');
      expect(packageRunOptions.projectPath).to.not.be.ok;
      expect(packageRunOptions.buildPath).to.not.be.ok;
      expect(packageRunOptions.environment).to.not.be.ok;
      expect(packageRunOptions.platform).to.not.be.ok;
      expect(packageRunOptions.arch).to.not.be.ok;

      expect(forgeMakeOptions.dir).to.equal(task.project.root);
      expect(forgeMakeOptions.outDir).to.equal('output');
      expect(forgeMakeOptions.skipPackage).to.be.ok;
      expect(forgeMakeOptions.overrideTargets).to.not.be.ok;
      expect(forgeMakeOptions).to.not.have.property('platform');
      expect(forgeMakeOptions).to.not.have.property('arch');
    });
  });

  it('should assemble, package and make when build path is specified', () => {
    let options = {
      buildPath: 'ember-build',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['package', 'forgeMake']);

      expect(packageRunOptions.buildPath).to.equal('ember-build');
    });
  });

  it('should package and make when assemble path is specified', () => {
    let options = {
      projectPath: 'project',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['package', 'forgeMake']);

      expect(packageRunOptions.projectPath).to.equal('project');
    });
  });

  it('should just make when skipPackage is specified', () => {
    let options = {
      projectPath: 'project',
      outputPath: 'output',
      skipPackage: true,
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['forgeMake']);

      expect(forgeMakeOptions.dir).to.equal(task.project.root);
      expect(forgeMakeOptions.outDir).to.equal('output');
      expect(forgeMakeOptions.skipPackage).to.be.ok;
      expect(forgeMakeOptions.overrideTargets).to.not.be.ok;
      expect(forgeMakeOptions).to.not.have.property('platform');
      expect(forgeMakeOptions).to.not.have.property('arch');
    });
  });

  it('should respect environment, platform, arch and targets when packaging and making', () => {
    let options = {
      environment: 'test',
      platform: 'win32',
      arch: 'ia32',
      targets: 'zip',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['package', 'forgeMake']);

      expect(packageRunOptions.environment).to.equal('test');
      expect(packageRunOptions.platform).to.equal('win32');
      expect(packageRunOptions.arch).to.equal('ia32');

      expect(forgeMakeOptions.platform).to.equal('win32');
      expect(forgeMakeOptions.arch).to.equal('ia32');
      expect(forgeMakeOptions.overrideTargets).to.deep.equal(['zip']);
    });
  });

  it('should respect platform, arch and targets when only making', () => {
    let options = {
      platform: 'win32',
      arch: 'ia32',
      targets: 'zip',
      outputPath: 'output',
      skipPackage: true,
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['forgeMake']);

      expect(forgeMakeOptions.platform).to.equal('win32');
      expect(forgeMakeOptions.arch).to.equal('ia32');
      expect(forgeMakeOptions.overrideTargets).to.deep.equal(['zip']);
    });
  });

  it('should handle multiple targets', () => {
    let options = {
      outputPath: 'output',
      targets: 'zip,squirrel',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['package', 'forgeMake']);

      expect(forgeMakeOptions.overrideTargets).to.deep.equal(['zip', 'squirrel']);
    });
  });

  it('should propagate package failures', () => {
    let options = {
      outputPath: 'output',
    };
    packageFail = true;

    expect(task.run(options)).to.be.rejected.then(() => {
      expect(operations).to.deep.equal(['package']);
    });
  });

  it('should propagate forgeMake failures', () => {
    let options = {
      outputPath: 'output',
    };
    forgeMakeFail = true;

    expect(task.run(options)).to.be.rejected;
  });
});
