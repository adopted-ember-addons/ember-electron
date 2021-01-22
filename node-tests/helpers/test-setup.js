const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Make sure our integration tests get the @electron-forge/core in our
// devDependencies/node_modules, since there isn't an electron-app/ folder
let forgeCorePath = require.resolve('@electron-forge/core');
sinon
  .createSandbox()
  .stub(require, 'resolve')
  .withArgs('@electron-forge/core')
  .returns(forgeCorePath);

afterEach(function () {
  sinon.restore();
  // Commands will set this when building, so clear it between tests
  delete process.env.EMBER_CLI_ELECTRON;
});
