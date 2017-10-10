'use strict';

const mockery = require('mockery');
const { resolve, reject } = require('rsvp');
const { clone } = require('lodash/lang');
const CoreObject = require('core-object');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');

describe('PackageTask', () => {
  let oldEnv;
  let useYarn;

  let operations;

  let assembleTaskOptions;
  let assembleRunOptions;
  let assembleFail;

  let forgePackageEnv;
  let forgePackageOptions;
  let forgePackageFail;

  let task;

  class MockAssembleTask extends CoreObject {
    constructor(options) {
      super(...arguments);
      assembleTaskOptions = clone(options);
    }

    run(options) {
      operations.push('assemble');
      assembleRunOptions = clone(options);

      return assembleFail ? reject() : resolve();
    }
  }

  function mockForgePackage(options) {
    operations.push('forgePackage');
    forgePackageEnv = clone(process.env);
    forgePackageOptions = clone(options);

    return forgePackageFail ? reject() : resolve();
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
    oldEnv = clone(process.env);
    operations = [];
    assembleTaskOptions = null;
    assembleRunOptions = null;
    assembleFail = false;
    forgePackageEnv = null;
    forgePackageOptions = null;
    forgePackageFail = false;

    mockery.registerMock('./assemble', MockAssembleTask);
    mockery.registerMock('../utils/yarn-or-npm', {
      setupForgeEnv() {
        process.env.NODE_INSTALLER = useYarn ? 'yarn' : 'npm';
      },
    });
    mockery.registerMock('electron-forge/dist/api/package', { default: mockForgePackage });

    const PackageTask = require('../../../lib/tasks/package');
    task = new PackageTask({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      project: new MockProject(),
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
    process.env = oldEnv;
  });

  it('should build, assemble and package when no input path is specified', () => {
    let options = {
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['assemble', 'forgePackage']);

      expect(assembleTaskOptions.ui).to.equal(task.ui);
      expect(assembleTaskOptions.analytics).to.equal(task.analytics);
      expect(assembleTaskOptions.project).to.equal(task.project);

      expect(assembleRunOptions.outputPath).to.be.ok;
      expect(assembleRunOptions.outputPath).to.not.equal('output'); // temp dir
      expect(assembleRunOptions.buildPath).to.not.be.ok;
      expect(assembleRunOptions.environment).to.not.be.ok;
      expect(assembleRunOptions.platform).to.not.be.ok;

      expect(forgePackageOptions.dir).to.equal(assembleRunOptions.outputPath);
      expect(forgePackageOptions.outDir).to.equal('output');
      expect(forgePackageOptions).to.not.have.property('platform');
      expect(forgePackageOptions).to.not.have.property('arch');
    });
  });

  it('should assemble and package when build path is specified', () => {
    let options = {
      buildPath: 'ember-build',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['assemble', 'forgePackage']);

      expect(assembleRunOptions.buildPath).to.equal('ember-build');
    });
  });

  it('should respect environment, platform and arch when assembling and packaging', () => {
    let options = {
      environment: 'test',
      platform: 'win32',
      arch: 'ia32',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['assemble', 'forgePackage']);

      expect(assembleRunOptions.environment).to.equal('test');
      expect(assembleRunOptions.platform).to.equal('win32');

      expect(forgePackageOptions.platform).to.equal('win32');
      expect(forgePackageOptions.arch).to.equal('ia32');
    });
  });

  it('should package already-assembled build when projectPath is specified', () => {
    let options = {
      projectPath: 'project',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['forgePackage']);

      expect(forgePackageOptions.dir).to.equal('project');
      expect(forgePackageOptions.outDir).to.equal('output');
      expect(forgePackageOptions).to.not.have.property('platform');
      expect(forgePackageOptions).to.not.have.property('arch');
    });
  });

  it('should respect platform and arch when packaging', () => {
    let options = {
      projectPath: 'project',
      platform: 'win32',
      arch: 'ia32',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['forgePackage']);

      expect(forgePackageOptions.platform).to.equal('win32');
      expect(forgePackageOptions.arch).to.equal('ia32');
    });
  });

  it('should tell electron-forge to use yarn when appropriate', () => {
    useYarn = true;

    let options = {
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(forgePackageEnv.NODE_INSTALLER).to.equal('yarn');
    });
  });

  it('should tell electron-forge to use npm when appropriate', () => {
    useYarn = false;

    let options = {
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(forgePackageEnv.NODE_INSTALLER).to.equal('npm');
    });
  });

  it('should propagate assemble failures', () => {
    let options = {
      outputPath: 'output',
    };
    assembleFail = true;

    expect(task.run(options)).to.be.rejected;
  });

  it('should propagate assemble failures', () => {
    let options = {
      outputPath: 'output',
    };
    assembleFail = true;

    expect(task.run(options)).to.be.rejected.then(() => {
      expect(operations).to.deep.equal(['assemble']);
    });
  });

  it('should propagate forgePackage failures', () => {
    let options = {
      outputPath: 'output',
    };
    forgePackageFail = true;

    expect(task.run(options)).to.be.rejected;
  });
});
