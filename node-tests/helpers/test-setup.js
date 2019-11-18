const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');

chai.use(chaiAsPromised);
chai.use(sinonChai);

afterEach(function() {
  sinon.restore();
  // Commands will set this when building, so clear it between tests
  delete process.env.EMBER_CLI_ELECTRON;
});
