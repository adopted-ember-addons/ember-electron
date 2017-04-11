'use strict';

const mockery = require('mockery');
const CoreObject = require('core-object');
const expect = require('../../helpers/expect');

describe('Builder model', () => {
  let env;
  let Builder;

  class MockBuilder extends CoreObject {
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
    env = process.env;
    process.env = {};

    mockery.registerMock('ember-cli/lib/models/builder', MockBuilder);

    Builder = require('../../../lib/models/builder');
  });

  afterEach(() => {
    process.env = env;

    mockery.deregisterAll();
    mockery.resetCache();
  });

  it('is a builder', () => {
    let builder = new Builder({});
    expect(builder).to.be.an.instanceOf(MockBuilder);
  });

  it('sets the right environment variables when not assembling', () => {
    new Builder({});
    expect(process.env.EMBER_CLI_ELECTRON).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_ASSEMBLE).to.not.be.ok;
  });

  it('sets the right environment variables when assembling', () => {
    new Builder({ assemble: true });
    expect(process.env.EMBER_CLI_ELECTRON).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_ASSEMBLE).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_PLATFORM).to.equal(process.platform);
  });

  it('respects the specified platform when assembling', () => {
    let platform = process.platform === 'darwin' ? 'linux' : 'darwin';

    new Builder({ assemble: true, platform });
    expect(process.env.EMBER_CLI_ELECTRON).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_ASSEMBLE).to.be.ok;
    expect(process.env.EMBER_CLI_ELECTRON_PLATFORM).to.equal(platform);
  });
});
