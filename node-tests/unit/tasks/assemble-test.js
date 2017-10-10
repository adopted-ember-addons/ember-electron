'use strict';

const mockery = require('mockery');
const { resolve, reject } = require('rsvp');
const { clone } = require('lodash/lang');
const CoreObject = require('core-object');
const MockUI = require('console-ui/mock');
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics');
const MockProject = require('../../helpers/mocks/project');
const expect = require('../../helpers/expect');

describe('AssembleTask', () => {
  let operations;

  let buildTaskOptions;
  let buildRunOptions;
  let buildTaskFail;

  let assemblerOptions;
  let assemblerFail;

  let useYarn;

  let installCommand;
  let installOptions;

  let task;

  class MockBuildTask extends CoreObject {
    constructor(options) {
      super(...arguments);
      buildTaskOptions = clone(options);
    }

    run(options) {
      operations.push('build');
      buildRunOptions = clone(options);

      return buildTaskFail ? reject() : resolve();
    }
  }

  class MockAssembler extends CoreObject {
    constructor(options) {
      super(...arguments);
      assemblerOptions = clone(options);
    }

    assemble() {
      operations.push('assemble');

      return assemblerFail ? reject() : resolve();
    }

    cleanup() {
      operations.push('cleanup');
    }
  }

  function mockInstall(command, args, opts) {
    operations.push('install-dependencies');
    installCommand = command;
    installOptions = opts;

    return resolve();
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
    buildTaskOptions = null;
    buildRunOptions = null;
    buildTaskFail = false;
    assemblerOptions = null;
    assemblerFail = false;
    installOptions = null;

    mockery.registerMock('./build', MockBuildTask);
    mockery.registerMock('../models/assembler', MockAssembler);
    mockery.registerMock('../utils/yarn-or-npm', { shouldUseYarn: () => useYarn });
    mockery.registerMock('execa', mockInstall);

    const AssembleTask = require('../../../lib/tasks/assemble');
    task = new AssembleTask({
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      project: new MockProject(),
    });
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
  });

  it('should build when no build path is specified', () => {
    let options = {
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['build', 'install-dependencies']);

      expect(buildTaskOptions.ui).to.equal(task.ui);
      expect(buildTaskOptions.analytics).to.equal(task.analytics);
      expect(buildTaskOptions.project).to.equal(task.project);

      expect(buildRunOptions.outputPath).to.equal('output');
      expect(buildRunOptions.environment).to.not.be.ok;
      expect(buildRunOptions.assemble).to.be.ok;
      expect(buildRunOptions.platform).to.not.be.ok;

      expect(installOptions).to.deep.equal({
        cwd: 'output',
      });
    });
  });

  it('should respect the environment and platform when building', () => {
    let options = {
      environment: 'test',
      platform: 'linux',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['build', 'install-dependencies']);

      expect(buildRunOptions.environment).to.equal('test');
      expect(buildRunOptions.platform).to.equal('linux');
    });
  });

  it('should fail on build failures', () => {
    let options = {
      outputPath: 'output',
    };
    buildTaskFail = true;

    expect(task.run(options)).to.be.rejected.then(() => {
      expect(operations).to.deep.equal(['build']);
    });
  });

  it('should assemble when a build path is specified', () => {
    let options = {
      buildPath: 'ember-build',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['assemble', 'cleanup', 'install-dependencies']);

      expect(assemblerOptions.ui).to.equal(task.ui);
      expect(assemblerOptions.platform).to.not.be.ok;
      expect(assemblerOptions.emberBuildPath).to.equal('ember-build');
      expect(assemblerOptions.outputPath).to.equal('output');
      expect(assemblerOptions.project).to.equal(task.project);

      expect(installOptions).to.deep.equal({
        cwd: 'output',
      });
    });
  });

  it('should respect the platform when assembling', () => {
    let options = {
      buildPath: 'ember-build',
      platform: 'linux',
      outputPath: 'output',
    };

    return task.run(options).then(() => {
      expect(operations).to.deep.equal(['assemble', 'cleanup', 'install-dependencies']);

      expect(assemblerOptions.platform).to.equal('linux');
    });
  });

  it('should use yarn when appropriate', () => {
    let options = {
      outputPath: 'output',
    };
    useYarn = true;

    expect(task.run(options)).to.be.rejected.then(() => {
      expect(installCommand).to.equal('yarn');
    });
  });

  it('should use npm when appropriate', () => {
    let options = {
      outputPath: 'output',
    };
    useYarn = false;

    expect(task.run(options)).to.be.rejected.then(() => {
      expect(installCommand).to.equal('npm');
    });
  });

  it('should fail on assemble failures', () => {
    let options = {
      buildPath: 'ember-build',
      outputPath: 'output',
    };
    assemblerFail = true;

    expect(task.run(options)).to.be.rejected.then(() => {
      expect(operations).to.deep.equal(['assemble', 'cleanup']);
    });
  });
});
