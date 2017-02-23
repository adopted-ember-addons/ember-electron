'use strict'

const mockery = require('mockery')
const mockSpawn = require('mock-spawn')
const RSVP = require('rsvp')
const os = require('os')
const Command = require('ember-cli/lib/models/command')
const MockUI = require('console-ui/mock')
const MockAnalytics = require('ember-cli/tests/helpers/mock-analytics')
const MockProject = require('../../helpers/mocks/project')
const expect = require('../../helpers/expect')

describe('ember electron command', () => {
  let CommandUnderTest, commandOptions, spawn, platform, _envElectron

  before(() => {
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

    spawn = mockSpawn()
    mockery.registerMock('child_process', {spawn})
    mockery.registerMock('os', { platform: () => platform || os.platform() })
    mockery.registerMock('../helpers/debug-server', {
      setRemoteDebugSocketScript () {},
      start () {}
    })

    CommandUnderTest = Command.extend(require('../../../lib/commands/electron'))

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

  it('should build the project before running Electron', () => {
    let tasks = []

    commandOptions.buildWatch = function () {
      tasks.push('buildWatch')
      return RSVP.resolve()
    }

    commandOptions.runElectron = function () {
      tasks.push('runElectron')
      return RSVP.resolve()
    }

    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.fulfilled.then(() => {
      expect(tasks).to.deep.equal(['buildWatch', 'runElectron'])
    })
  })

  it('should not run Electron when the build fails', () => {
    let tasks = []

    commandOptions.buildWatch = function () {
      tasks.push('buildWatch')
      return RSVP.reject()
    }

    commandOptions.runElectron = function () {
      tasks.push('runElectron')
      return RSVP.resolve()
    }

    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.rejected.then(() => {
      expect(tasks).to.deep.equal(['buildWatch'])
    })
  })

  it('should not keep watching if Electron fails to run', function () {
    let tasks = []

    commandOptions.buildWatch = function () {
      tasks.push('buildWatch')
      return RSVP.resolve()
    }

    commandOptions.runElectron = function () {
      tasks.push('runElectron')
      return RSVP.reject()
    }

    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.rejected.then(() => {
      expect(tasks).to.deep.equal(['buildWatch', 'runElectron'])
    })
  })

  it('should spawn a `Electron` process with the right arguments', () => {
    mockery.registerMock('../helpers/find-electron', {
      getElectronApp () { return 'Electron' }
    })

    commandOptions.buildWatch = function () {
      return RSVP.resolve()
    }

    let command = new CommandUnderTest(commandOptions).validateAndRun()
    let ui = commandOptions.ui

    return expect(command).to.be.fulfilled.then(() => {
      expect(spawn.calls.length).to.equal(1)
      expect(spawn.calls[0].command).to.contain('Electron')
      expect(spawn.calls[0].args).to.deep.equal(['.'])

      expect(ui.output).to.contain('Starting Electron...')
      expect(ui.output).to.contain('Electron exited.')
    })
  })

  it('should set the spawn shell option to true on win32', () => {
    commandOptions.buildWatch = function () {
      return RSVP.resolve()
    }

    platform = 'win32'
    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.fulfilled.then(() => {
      expect(spawn.calls.length).to.equal(1)
      expect(spawn.calls[0].opts.shell).to.equal(true)
    })
  })

  it('should set the spawn shell option to false if not on win32', () => {
    commandOptions.buildWatch = function () {
      return RSVP.resolve()
    }

    platform = 'darwin'
    let command = new CommandUnderTest(commandOptions).validateAndRun()

    return expect(command).to.be.fulfilled.then(() => {
      expect(spawn.calls.length).to.equal(1)
      expect(spawn.calls[0].opts.shell).to.equal(false)
    })
  })

  it('should print a friendly message when the `Electron` command cannot be found', () => {
    mockery.registerMock('../helpers/find-electron', {
      getElectronApp () { return 'Electron' }
    })

    commandOptions.buildWatch = function () {
      return RSVP.resolve()
    }

    let command = new CommandUnderTest(commandOptions).validateAndRun()
    let ui = commandOptions.ui

    spawn.sequence.add(function () {
      this.emit('error', {
        code: 'ENOENT'
      })
    })

    return expect(command).to.be.rejected
      .then(() => {
        expect(spawn.calls.length).to.equal(1)
        expect(spawn.calls[0].command).to.equal('Electron')
        expect(spawn.calls[0].args).to.deep.equal(['.'])

        expect(ui.output).to.contain('Starting Electron...')
        expect(ui.output).to.contain('Error running the following command: Electron')
        expect(ui.output).to.contain('re-run the blueprint')
      })
  })
})
