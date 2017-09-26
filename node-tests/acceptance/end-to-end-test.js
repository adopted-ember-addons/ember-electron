'use strict';

const path = require('path');
const {
  copySync,
  existsSync,
  readFileSync,
  readJsonSync,
  removeSync,
  writeFileSync,
  writeJsonSync,
} = require('fs-extra');
const execa = require('execa');
const tmp = require('tmp');

const expect = require('../helpers/expect');

function run(cmd, args, opts = {}) {
  opts.stdio = opts.stdio || 'inherit';

  return execa(cmd, args, opts);
}

describe('end-to-end', function() {
  this.timeout(10 * 60 * 1000);

  let oldEnv;
  let rootDir = process.cwd();
  let emberPath = path.join(rootDir, 'node_modules', '.bin', 'ember');
  let { name: packageTmpDir } = tmp.dirSync();

  function ember(...args) {
    return listenForPrompts(run(emberPath, args, {
      stdio: ['pipe', 'pipe', process.stderr],
    }));
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

    //
    // Pack up current ember-electron directory so it can be installed in new
    // ember projects.
    //
    return run('yarn', ['pack', '--filename', path.join(packageTmpDir, 'ember-electron.tgz')]).then(() => {
      process.chdir(packageTmpDir);

      return run('tar', ['-xzf', 'ember-electron.tgz']);
    }).then(() => {
      // Prevent yarn caching from screwing us
      let packageJson = readJsonSync(path.join('package', 'package.json'));
      packageJson.version = `${packageJson.version}-${new Date().getTime()}`;
      writeJsonSync(path.join('package', 'package.json'), packageJson);
    });
  });

  after(() => {
    process.env = oldEnv;
  });

  afterEach(() => {
    removeSync('electron-out');
  });

  describe('with yarn', function() {
    before(function() {
      let { name: tmpDir } = tmp.dirSync();
      process.chdir(tmpDir);

      return ember('new', 'ee-test-app', '--yarn').then(() => {
        process.chdir('ee-test-app');

        return ember('install', `ember-electron@${path.join(packageTmpDir, 'package')}`);
      });
    });

    after(() => {
      process.chdir(rootDir);
    });

    runTests();
  });

  describe('with npm', function() {
    before(function() {
      let { name: tmpDir } = tmp.dirSync();
      process.chdir(tmpDir);

      return ember('new', 'ee-test-app').then(() => {
        process.chdir('ee-test-app');

        return ember('install', `ember-electron@${path.join(packageTmpDir, 'package')}`);
      });
    });

    after(() => {
      process.chdir(rootDir);
    });

    runTests();
  });

  function runTests() {
    it('tests', () => {
      return expect(ember('electron:test')).to.eventually.be.fulfilled;
    });

    it('builds', () => {
      return ember('electron:build').then(() => {
        expect(existsSync(path.join('electron-out', 'ember'))).to.be.ok;
      });
    });

    it('assembles', () => {
      return ember('electron:assemble').then(() => {
        expect(existsSync(path.join('electron-out', 'project'))).to.be.ok;
      });
    });

    it('packages', () => {
      return ember('electron:package').then(() => {
        expect(existsSync(path.join('electron-out', `ee-test-app-${process.platform}-${process.arch}`))).to.be.ok;
      });
    });

    it('makes', () => {
      // Only build zip target so we don't fail from missing platform dependencies
      // (e.g. rpmbuild)
      return ember('electron:make', '--targets', 'zip').then(() => {
        expect(existsSync(path.join('electron-out', 'make'))).to.be.ok;
      });
    });

    it('extra checks pass', () => {
      let fixturePath = path.resolve(__dirname, '..', 'fixtures', 'ember-test');

      // Append our extra test content to the end of test-main.js
      let testMainPath = path.join('ember-electron', 'test-main.js');
      let extraContentPath = path.join(fixturePath, 'test-main-extra.js');
      let content = [
        readFileSync(testMainPath),
        readFileSync(extraContentPath),
      ].join('\n');
      writeFileSync(path.join('ember-electron', 'test-main.js'), content);

      // Copy the lib and resources directories over
      ['lib', 'resources'].forEach((dir) => {
        copySync(path.join(fixturePath, dir), path.join('ember-electron', dir));
      });

      return expect(ember('electron:test')).to.eventually.be.fulfilled;
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
