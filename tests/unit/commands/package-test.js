'use strict'

const mockery = require('mockery')
const RSVP = require('rsvp')
const Command = require('ember-cli/lib/models/command')
const MockUI = require('ember-cli/tests/helpers/mock-ui')
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics')
const MockProject = require('../../helpers/mocks/project')
const expect = require('../../helpers/expect')

describe('ember electron:package command', () => {
  var CommandUnderTest, commandOptions, _envElectron

  before(() => {
    process.env.EMBER_ELECTRON_TESTING = true
    mockery.enable({
      useCleanCache: true,
      warnOnUnregistered: false
    })
  })

  after(() => {
    mockery.disable()
  })

  beforeEach(() => {
    _envElectron = process.env.ELECTRON_PATH
    delete process.env.ELECTRON_PATH

    var mockPackager = function (options, done) {
      done()
    }

    mockery.registerMock('electron-packager', mockPackager)

    let cmd = require('../../../lib/commands/package')
    CommandUnderTest = Command.extend(cmd)

    commandOptions = {
      ui: new MockUI(),
      analytics: new MockAnalytics(),
      settings: {},
      project: new MockProject('project-empty')
    }
  })

  afterEach(() => {
    if (_envElectron) {
      process.env.ELECTRON_PATH = _envElectron
    } else {
      delete process.env.ELECTRON_PATH
    }

    mockery.deregisterAll()
    mockery.resetCache()
  })

  it('should build the project before organizing', () => {
    let tasks = []

    commandOptions.build = function () {
      tasks.push('build')
      return RSVP.resolve()
    }

    commandOptions.organize = function () {
      tasks.push('organize')
      return RSVP.resolve()
    }

    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.fulfilled.then(() => {
      expect(tasks).to.deep.equal(['build', 'organize'])
    })
  })

  it('should build for the appropriate environment', () => {
    let testEnv = 'development'
    let builtEnv = null

    commandOptions.settings.environment = testEnv
    commandOptions.tasks = {
      Build: function () {
        return {
          run: function (options) {
            builtEnv = options.environment
            return RSVP.resolve()
          }
        }
      }
    }

    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.fulfilled.then(() => {
      expect(builtEnv).to.equal(testEnv)
    })
  })

  it('should build production environment by default', () => {
    let builtEnv = null

    commandOptions.tasks = {
      Build: function () {
        return {
          run: function (options) {
            builtEnv = options.environment
            return RSVP.resolve()
          }
        }
      }
    }

    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.fulfilled.then(() => {
      expect(builtEnv).to.equal('production')
    })
  })

  it('should not attempt packaging when the build fails', () => {
    let tasks = []

    commandOptions.build = function () {
      tasks.push('build')
      return RSVP.reject()
    }

    commandOptions.organize = function () {
      tasks.push('organize')
      return RSVP.resolve()
    }

    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.rejected.then(() => {
      expect(tasks).to.deep.equal(['build'])
    })
  })
})
