const Blueprint = require('ember-cli/lib/models/blueprint');
const { expect } = require('chai');
const tmp = require('tmp');
const { copyFileSync, mkdirSync } = require('fs');
const path = require('path');

describe('blueprint', function () {
  let rootDir;
  let blueprint;

  beforeEach(function () {
    rootDir = process.cwd();
    let { name } = tmp.dirSync();
    process.chdir(name);

    let blueprintPath = path.join(__dirname, '..', '..', 'blueprints');
    blueprint = Blueprint.lookup('ember-electron', { paths: [blueprintPath] });
    blueprint.ui = { writeLine() {} };
  });

  afterEach(function () {
    process.chdir(rootDir);
  });

  describe('update config/environment.js', function () {
    let oldEnv;
    beforeEach(function () {
      oldEnv = process.env;
      process.env = {};
    });

    afterEach(function () {
      process.env = oldEnv;
    });

    async function getEnv() {
      let environmentJsFixture = path.join(
        __dirname,
        '..',
        'fixtures',
        'config-environment',
        'environment.js',
      );
      let environmentJs = path.join(process.cwd(), 'config', 'environment.js');

      mkdirSync('config');
      copyFileSync(environmentJsFixture, environmentJs);

      await blueprint.updateEnvironmentConfig();

      let factory = require(environmentJs);
      return factory();
    }

    it('non-electron build', async function () {
      let ENV = await getEnv();
      expect(ENV.rootURL).to.equal('/');
      expect(ENV.locationType).to.equal('auto');
    });

    it('electron build', async function () {
      process.env.EMBER_CLI_ELECTRON = '1';
      let ENV = await getEnv();
      expect(ENV.rootURL).to.equal('');
      expect(ENV.locationType).to.equal('hash');
    });
  });
});
