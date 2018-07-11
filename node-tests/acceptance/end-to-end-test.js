'use strict';

const path = require('path');
const {
  copySync,
  existsSync,
  readdirSync,  // DEBUG
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

  describe.only('with npm', function() {
    before(function() {
      let { name: tmpDir } = tmp.dirSync();
      process.chdir(tmpDir);

      return ember('new', 'ee-test-app').then(() => {
        process.chdir('ee-test-app');
        const nm = readdirSync(path.join(process.cwd(), 'node_modules'));
        console.log(`JRQ-DEBUG: After 'ember new' and before 'ember install', node_modules does ${nm.indexOf('ember-cli') === -1 ? 'NOT ' : ''}contain ember-cli`);
        try {
          const ecliDir = path.join(process.cwd(), 'node_modules', 'ember-cli');
          const ecli = readdirSync(ecliDir);
          console.log(`JRQ-DEBUG: node_modules/ember-cli -->`, ecli);
          console.log(`JRQ-DEBUG: require 1`, require(path.join(ecliDir, 'package.json')).version);
          console.log(`JRQ-DEBUG: require 2`, require('ember-cli/package.json').version);
        } catch (e) {
          console.warn("JRQ-DEBUG: Caught exception while trying to peek into ember-cli", e);
        }

        return ember('install', `ember-electron@${path.join(packageTmpDir, 'package')}`);
      }).then(() => {
        console.log(`JRQ-DEBUG: ember-install finished!`);

        return arguments;
      }).catch((e) => {
        console.warn(`JRQ-DEBUG: Caught exception during ember new + ember install`, e);
        try {
          const ecliDir = path.join(process.cwd(), 'node_modules', 'ember-cli');
          const ecli = readdirSync(ecliDir);
          console.log(`JRQ-DEBUG: node_modules/ember-cli (number of files/dirs) -->`, ecli.length);
          console.log(`JRQ-DEBUG: package.json.version -->`, require(path.join(ecliDir, 'package.json')).version);
          console.log(`JRQ-DEBUG: require blueprint -->`, require(path.join(ecliDir, 'lib', 'models', 'blueprint.js')));
        } catch (e) {
          console.warn("JRQ-DEBUG: Caught exception while trying to peek into ember-cli", e);
        }
        throw e;
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

  describe('test-runner.js/blueprint update', function() {
    before(function() {
      let { name: tmpDir } = tmp.dirSync();
      process.chdir(tmpDir);

      return ember('new', 'ee-test-app', '--yarn').then(() => {
        process.chdir('ee-test-app');

        return ember('install', 'ember-electron@2.7.2');
      }).then(() => {
        // Now that the old blueprint has been run, use yarn to update the addon
        // to the current version
        return run('yarn', ['add', '-D', path.join(packageTmpDir, 'package')]);
      });
    });

    after(() => {
      process.chdir(rootDir);
    });

    it('can run tests without re-running the blueprint (deprecated)', function() {
      return expect(ember('electron:test')).to.eventually.be.fulfilled;
    });
  });
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
