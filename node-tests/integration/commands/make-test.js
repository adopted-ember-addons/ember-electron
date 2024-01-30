'use strict';

const mockElectronProject = require('../../helpers/mock-electron-project');
const MockUI = require('console-ui/mock');
const MockProject = require('ember-cli/tests/helpers/mock-project');
const { expect } = require('chai');
const BuildTask = require('ember-cli/lib/tasks/build');
const MakeCommand = require('../../../lib/commands/make');
const MakeTask = require('../../../lib/tasks/make');
const PublishTask = require('../../../lib/tasks/publish');
const DependencyChecker = require('ember-cli-dependency-checker/lib/dependency-checker');
const { api } = require('../../../lib/utils/forge-core');
const rimraf = require('rimraf');
const path = require('path');
const sinon = require('sinon');

describe('electron:make command', function () {
  mockElectronProject();

  let buildTaskStub;
  let command;

  beforeEach(function () {
    buildTaskStub = sinon.stub(BuildTask.prototype, 'run').resolves();
    sinon.stub(api, 'make').resolves();
    sinon.stub(api, 'publish').resolves();

    command = new MakeCommand({
      ui: new MockUI(),
      settings: {},
      project: new MockProject(),
      tasks: {
        Build: BuildTask,
        ElectronMake: MakeTask,
        ElectronPublish: PublishTask,
      },
    });
  });

  it('works', async function () {
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(buildTaskStub).to.be.calledOnce;
    expect(buildTaskStub.firstCall.args[0].outputPath).to.equal(
      path.join('electron-app', 'ember-dist'),
    );
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: path.resolve('electron-app'),
      outDir: path.join('electron-app', 'out'),
      skipPackage: false,
    });
    expect(api.make.firstCall).to.be.calledAfter(buildTaskStub.firstCall);
  });

  it('builds with EMBER_CLI_ELECTRON set', async function () {
    let envVal;
    buildTaskStub.resetBehavior();
    buildTaskStub.callsFake(() => {
      envVal = process.env.EMBER_CLI_ELECTRON;
      return Promise.resolve();
    });

    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(envVal).to.be.ok;
  });

  it('runs the dependency checker', async function () {
    sinon.spy(DependencyChecker.prototype, 'checkDependencies');
    await expect(command.validateAndRun([])).to.be.fulfilled;
    expect(DependencyChecker.prototype.checkDependencies).to.be.calledOnce;
  });

  it('builds for the correct environment', async function () {
    await expect(command.validateAndRun(['--environment', 'testing'])).to.be
      .fulfilled;
    expect(buildTaskStub).to.be.calledOnce;
    expect(buildTaskStub.firstCall.args[0].environment).to.equal('testing');
  });

  it('can skip building', async function () {
    await expect(command.validateAndRun(['--skip-build'])).to.be.fulfilled;
    expect(buildTaskStub).to.not.be.called;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: path.resolve('electron-app'),
      outDir: path.join('electron-app', 'out'),
      skipPackage: false,
    });
  });

  it('can skip packaging (which also skips building)', async function () {
    await expect(command.validateAndRun(['--skip-package'])).to.be.fulfilled;
    expect(buildTaskStub).to.not.be.called;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: path.resolve('electron-app'),
      outDir: path.join('electron-app', 'out'),
      skipPackage: true,
    });
  });

  it('can skip building and packaging explicitly', async function () {
    await expect(command.validateAndRun(['--skip-package'])).to.be.fulfilled;
    expect(buildTaskStub).to.not.be.called;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: path.resolve('electron-app'),
      outDir: path.join('electron-app', 'out'),
      skipPackage: true,
    });
  });

  it('can set the platform, arch, and output path', async function () {
    await expect(
      command.validateAndRun([
        '--platform',
        'linux',
        '--arch',
        'ia32',
        '--output-path',
        'some-dir',
      ]),
    ).to.be.fulfilled;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: path.resolve('electron-app'),
      outDir: path.resolve('some-dir'),
      platform: 'linux',
      arch: 'ia32',
      skipPackage: false,
    });
  });

  it('can set one override target', async function () {
    await expect(command.validateAndRun(['--targets', 'zip'])).to.be.fulfilled;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: path.resolve('electron-app'),
      outDir: path.join('electron-app', 'out'),
      skipPackage: false,
      overrideTargets: ['zip'],
    });
  });

  it('can set multiple override targets', async function () {
    await expect(command.validateAndRun(['--targets', 'zip,dmg,deb'])).to.be
      .fulfilled;
    expect(api.make).to.be.calledOnce;
    expect(api.make.firstCall.args[0]).to.deep.equal({
      dir: path.resolve('electron-app'),
      outDir: path.join('electron-app', 'out'),
      skipPackage: false,
      overrideTargets: ['zip', 'dmg', 'deb'],
    });
  });

  it('errors if the electron project directory is not present', async function () {
    rimraf.sync('electron-app');
    await expect(command.validateAndRun([])).to.be.rejected;
  });

  it('can publish', async function () {
    let makeResults = { foo: 'bar' };
    api.make.resetBehavior();
    api.make.resolves(makeResults);

    await expect(command.validateAndRun(['---publish'])).to.be.fulfilled;

    expect(api.publish).to.be.calledOnce;
    expect(api.publish.firstCall.args[0].dir).to.equal(
      path.resolve('electron-app'),
    );
    expect(api.publish.firstCall.args[0].makeResults).to.equal(makeResults);
    expect(api.publish.firstCall.args[0].publishTargets).to.be.undefined;
  });

  it('can publish and set one override publish-target', async function () {
    await expect(
      command.validateAndRun(['---publish', '--publish-targets=foo']),
    ).to.be.fulfilled;

    expect(api.publish).to.be.calledOnce;
    expect(api.publish.firstCall.args[0].publishTargets).to.deep.equal(['foo']);
  });

  it('can publish and set multiple override publish-targets', async function () {
    await expect(
      command.validateAndRun(['---publish', '--publish-targets=foo,bar']),
    ).to.be.fulfilled;
    expect(api.publish).to.be.calledOnce;
    expect(api.publish.firstCall.args[0].publishTargets).to.deep.equal([
      'foo',
      'bar',
    ]);
  });
});
