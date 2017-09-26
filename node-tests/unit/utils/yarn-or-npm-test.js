'use strict';

const tmp = require('tmp');
const path = require('path');
const { writeFileSync } = require('fs');
const { clone } = require('lodash/lang');
const mockery = require('mockery');
const expect = require('../../helpers/expect');

describe('yarn-or-npm', () => {
  let projectDir;
  let oldEnv;
  let useYarn;

  let shouldUseYarn;
  let setupForgeEnv;

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
    ({ name: projectDir } = tmp.dirSync());
    oldEnv = clone(process.env);
    mockery.registerMock('yarn-or-npm', { hasYarn: () => useYarn });
    ({ shouldUseYarn, setupForgeEnv } = require('../../../lib/utils/yarn-or-npm'));
  });

  afterEach(() => {
    mockery.deregisterAll();
    mockery.resetCache();
    process.env = oldEnv;
  });

  function createFiles({ yarnLock, yarn } = {}) {
    if (yarnLock) {
      writeFileSync(path.join(projectDir, 'yarn.lock'), 'yarn!');
    }

    useYarn = Boolean(yarn);
  }

  describe('shouldUseYarn', () => {
    it('works when yarn.lock and yarn are both present', () => {
      createFiles({ yarnLock: true, yarn: true });
      expect(shouldUseYarn(projectDir)).to.be.ok;
    });

    it('works when yarn.lock is present, but yarn is not', () => {
      createFiles({ yarnLock: true });
      expect(shouldUseYarn(projectDir)).to.be.not.ok;
    });

    it('works when yarn is present, but yarn.lock is not', () => {
      createFiles({ yarn: true });
      expect(shouldUseYarn(projectDir)).to.be.not.ok;
    });
  });

  describe('setupForgeEnv', () => {
    it('works when yarn.lock and yarn are both present', () => {
      createFiles({ yarnLock: true, yarn: true });
      setupForgeEnv(projectDir);
      expect(process.env.NODE_INSTALLER).to.equal('yarn');
    });

    it('works when yarn.lock is present, but yarn is not', () => {
      createFiles({ yarnLock: true });
      setupForgeEnv(projectDir);
      expect(process.env.NODE_INSTALLER).to.equal('npm');
    });

    it('works when yarn is present, but yarn.lock is not', () => {
      createFiles({ yarn: true });
      setupForgeEnv(projectDir);
      expect(process.env.NODE_INSTALLER).to.equal('npm');
    });
  });
});
