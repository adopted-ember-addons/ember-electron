'use strict';

const path = require('path');
const {
  existsSync,
  readJsonSync,
  removeSync,
  writeJsonSync,
} = require('fs-extra');
const execa = require('execa');
const tmp = require('tmp');

const expect = require('../helpers/expect');

function run(...args) {
  return execa(...args, { stdio: 'inherit' });
}

describe('end-to-end', function() {
  this.timeout(5 * 60 * 1000);

  let rootDir = process.cwd();
  let emberPath = path.join(rootDir, 'node_modules', '.bin', 'ember');

  function ember(...args) {
    return run(emberPath, args);
  }

  before(function() {
    this.timeout(10 * 60 * 1000);

    let { version } = require(path.join(rootDir, 'package.json'));
    let { name: tmpDir } = tmp.dirSync();
    process.chdir(tmpDir);

    return run('npm', ['pack', rootDir]).then(() => {
      return ember('new', 'ee-test-app');
    }).then(() => {
      process.chdir('ee-test-app');

      // We can't tell the blueprint not to prompt :(
      removeSync('.travis.yml');

      // yarn currently has some kind of bug when installing from the filesystem
      return run('npm', ['install', '--save-dev', path.join(tmpDir, `ember-electron-${version}.tgz`)]);
    }).then(() => {
      // yarn bug -- need to get the file: URI out of package.json or when the
      // blueprint triggers forge import, which uses yarn to install
      // dependencies, yarn will barf
      let packageJson = readJsonSync('package.json');
      packageJson.devDependencies['ember-electron'] = version;
      writeJsonSync('package.json', packageJson, { spaces: 2 });

      return ember('g', 'ember-electron');
    });
  });

  after(() => {
    process.chdir(rootDir);
  });

  afterEach(() => {
    removeSync('electron-out');
  });

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
});
