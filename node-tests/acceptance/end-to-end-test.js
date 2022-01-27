'use strict';

const {
  electronProjectPath,
  packageOutPath,
  emberBuildDir,
  emberTestBuildDir,
  emberTestBuildPath,
} = require('../../lib/utils/build-paths');
const path = require('path');
const {
  existsSync,
  readdirSync,
  readFileSync,
  readJsonSync,
  removeSync,
  writeFileSync,
  writeJsonSync,
} = require('fs-extra');
const { promisify } = require('util');
const ncp = promisify(require('ncp'));
const execa = require('execa');
const tmp = require('tmp');
const { expect } = require('chai');

function run(cmd, args, opts = {}) {
  opts.stdio = opts.stdio || 'inherit';

  return execa(cmd, args, opts);
}

describe('end-to-end', function () {
  this.timeout(10 * 60 * 1000);

  let oldEnv;
  let rootDir = process.cwd();
  let emberPath = path.join(rootDir, 'node_modules', '.bin', 'ember');
  let { name: packageTmpDir } = tmp.dirSync();

  function ember(...args) {
    return listenForPrompts(
      run(emberPath, args, {
        stdio: ['pipe', 'pipe', process.stderr],
      })
    );
  }

  before(() => {
    // If we're running via a yarn script like `yarn test`, then we'll have
    // a whole bunch of npm_* environment variables set by yarn that can mess
    // things up, so let's scrub them.
    oldEnv = Object.assign({}, process.env);
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith('npm_')) {
        delete process.env[key];
      }
    });

    // Pack up current ember-electron directory so it can be installed in new ember projects.
    return run('yarn', [
      'pack',
      '--filename',
      path.join(packageTmpDir, 'ember-electron.tgz'),
    ])
      .then(() => {
        process.chdir(packageTmpDir);

        return run('tar', ['-xzf', 'ember-electron.tgz']);
      })
      .then(() => {
        // Prevent yarn caching from screwing us
        let packageJson = readJsonSync(path.join('package', 'package.json'));
        packageJson.version = `${packageJson.version}-${new Date().getTime()}`;
        writeJsonSync(path.join('package', 'package.json'), packageJson);

        // Save modified package back into tarball so we can have npm use that directly
        return run('tar', ['-cf', 'ember-electron-cachebust.tar', 'package']);
      });
  });

  after(() => {
    process.env = oldEnv;
  });

  afterEach(() => {
    removeSync(packageOutPath);
  });

  if (
    !process.env.END_TO_END_TESTS ||
    process.env.END_TO_END_TESTS === 'yarn'
  ) {
    describe('with yarn', function () {
      before(function () {
        let { name: tmpDir } = tmp.dirSync();
        process.chdir(tmpDir);

        return ember(
          'new',
          'ee-test-app',
          '--yarn',
          '--skip-git',
          '--no-welcome'
        ).then(() => {
          process.chdir('ee-test-app');

          return ember(
            'install',
            `ember-electron@${path.join(packageTmpDir, 'package')}`
          );
        });
      });

      after(() => {
        process.chdir(rootDir);
      });

      runTests();
    });
  }

  if (!process.env.END_TO_END_TESTS || process.env.END_TO_END_TESTS === 'npm') {
    describe('with npm', function () {
      before(function () {
        let { name: tmpDir } = tmp.dirSync();
        process.chdir(tmpDir);

        return ember(
          'new',
          'ee-test-app',
          '--yarn',
          'false',
          '--skip-git',
          '--no-welcome'
        ).then(() => {
          process.chdir('ee-test-app');
          // For some reason, either ember-cli-dependency-checker isn't working with npm
          // or npm isn't getting the right version because without this env var (or hacking package.json)
          // we get:
          //     Missing npm packages:
          //     Package: ember-electron
          //       * Specified: file:../../tmp-230055rygYPzwOs0w/ember-electron-cachebust.tar
          //       * Installed: file:/tmp/tmp-230055rygYPzwOs0w/ember-electron-cachebust.tar
          //
          //     Run `npm install` to install missing dependencies.
          process.env.SKIP_DEPENDENCY_CHECKER = true;

          return ember(
            'install',
            `ember-electron@${path.join(
              packageTmpDir,
              'ember-electron-cachebust.tar'
            )}`,
            '--no-yarn'
          );
        });
      });

      after(() => {
        process.chdir(rootDir);
      });

      runTests();
    });
  }

  function runTests() {
    before(function () {
      //
      // Install fixture
      //
      let fixturePath = path.resolve(__dirname, '..', 'fixtures', 'ember-test');

      // Append our extra test content to the end of test/index.js
      let testIndexPath = path.join('electron-app', 'tests', 'index.js');
      let extraContentPath = path.join(fixturePath, 'test-index-extra.js');
      let content = [
        readFileSync(testIndexPath),
        readFileSync(extraContentPath),
      ].join('\n');
      writeFileSync(testIndexPath, content);

      // Copy the source files over
      ncp(path.join(fixturePath, 'src'), path.join(electronProjectPath, 'src'));
    });

    it('builds', () => {
      return ember('electron:build').then(() => {
        expect(existsSync(path.join('electron-app', 'ember-dist'))).to.be.ok;
      });
    });

    it('tests', () => {
      return expect(ember('electron:test')).to.eventually.be.fulfilled;
    });

    it('packages', async function () {
      expect(existsSync(emberTestBuildPath)).to.be.ok;
      expect(existsSync(path.join(electronProjectPath, 'tests'))).to.be.ok;

      await expect(ember('electron:package')).to.be.fulfilled;

      let packageDir = path.join(
        packageOutPath,
        `ee-test-app-${process.platform}-${process.arch}`
      );
      expect(existsSync(packageDir)).to.be.ok;

      let appPath;
      if (process.platform === 'darwin') {
        appPath = 'ee-test-app.app/Contents/Resources/app/';
      } else {
        appPath = 'resources/app';
      }

      let entries = readdirSync(path.join(packageDir, appPath));
      expect(entries).to.include(emberBuildDir);
      expect(entries).not.to.include(emberTestBuildDir);
      expect(entries).not.to.include('tests');
    });

    it('makes', () => {
      // Only build zip target so we don't fail from missing platform dependencies
      // (e.g. rpmbuild). The default template specifies only darwin for the zip
      // target, so we delete the targets setting so it's enabled for all targets
      // the zip maker supports, which is all of them.
      let packageJsonPath = path.join('electron-app', 'package.json');
      let packageJson = readJsonSync(packageJsonPath);
      let makers = packageJson.config.forge.makers;
      let zipMaker = makers.find((m) => m.name === '@electron-forge/maker-zip');
      delete zipMaker.platforms;
      writeJsonSync(packageJsonPath, packageJson);

      return ember(
        'electron:make',
        '--targets',
        '@electron-forge/maker-zip'
      ).then(() => {
        expect(existsSync(path.join(packageOutPath, 'make'))).to.be.ok;
      });
    });

    it('lints after other commands have run', async function () {
      await expect(run('./node_modules/.bin/eslint', ['.'])).to.be.fulfilled;
    });
  }
});

function listenForPrompts(child) {
  let { stdout, stdin } = child;

  let stdoutData = '';
  stdout.setEncoding('utf8');
  stdout.on('data', (chunk) => {
    process.stdout.write(chunk);

    // See if we have a prompt
    stdoutData += chunk;
    if (/^\? Overwrite/m.test(stdoutData)) {
      stdin.write('n\n');
    }
    // Chop off all complete lines
    stdoutData = stdoutData.slice(stdoutData.lastIndexOf('\n') + 1);
  });

  return child;
}
