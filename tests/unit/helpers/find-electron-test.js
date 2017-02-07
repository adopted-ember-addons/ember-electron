'use strict'

const path = require('path')
const mockery = require('mockery')
const tmp = require('tmp')
const denodeify = require('rsvp').denodeify
const ncp = denodeify(require('ncp'))
const copySync = require('fs-extra').copySync
const execSync = require('child_process').execSync
const expect = require('../../helpers/expect')

describe('electron-finder', () => {
  let tmpObj
  let findElectron

  function setupFixture (name, platform) {
    let fixturesPath = path.resolve(__dirname, '..', '..', 'fixtures')
    let fixturePath = path.join(fixturesPath, name)
    let destPath = path.join(tmpObj.name, name)
    return ncp(fixturePath, destPath).then(() => {
      let helpersPath = path.resolve(__dirname, '..', '..', '..', 'lib', 'helpers')
      return ncp(helpersPath, destPath)
    }).then(() => {
      let scriptPath = path.join(destPath, 'test-find-electron.js')
      copySync(path.join(fixturesPath, 'test-find-electron.js'), scriptPath)
      findElectron = function () {
        return execSync('node ' + scriptPath + ' ' + platform, { cwd: destPath }).toString()
      }
    })
  }

  before(() => {
    tmpObj = tmp.dirSync({ unsafeCleanup: true })
  })

  after(() => {
    tmpObj.removeCallback()
    findElectron = undefined
  })

  describe('when the `electron-prebuilt` npm package is installed', () => {
    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnUnregistered: false
      })
    })

    after(() => {
      mockery.disable()
    })

    describe('and the platform is Mac', () => {
      before(() => {
        mockery.registerMock('os', {
          platform: function () {
            return 'darwin'
          }
        })

        return setupFixture('project-darwin', 'darwin')
      })

      after(() => {
        mockery.deregisterMock('os')
        mockery.resetCache()
      })

      it('should be `node_modules/electron-prebuilt/dist/Electron.app/Contents/MacOS/Electron`', function () {
        let electron = findElectron()
        let expectedElectron = ['node_modules', 'electron-prebuilt', 'dist', 'Electron.app', 'Contents', 'MacOS', 'Electron'].join(path.sep)

        expect(electron).to.contain(expectedElectron)
      })
    })

    describe('and the platform is Windows', () => {
      before(() => {
        mockery.registerMock('os', {
          platform: function () {
            return 'win32'
          }
        })

        return setupFixture('project-win32', 'win32')
      })

      after(() => {
        mockery.deregisterMock('os')
        mockery.resetCache()
      })

      it('should be `node_modules/electron/electronjs/electron.exe`', () => {
        let electron = findElectron()
        let expectedElectron = ['node_modules', 'electron-prebuilt', 'dist', 'electron.exe'].join(path.sep)

        expect(electron).to.contain(expectedElectron)
      })
    })

    describe('and the platform is not Mac or Windows (aka Linux)', () => {
      before(() => {
        mockery.registerMock('os', {
          platform: function () {
            return 'linux'
          }
        })

        return setupFixture('project-linux', 'linux')
      })

      after(() => {
        mockery.deregisterMock('os')
        mockery.resetCache()
      })

      it('should be `node_modules/electron-prebuilt/dist/electron`', () => {
        let electron = findElectron()
        let expectedElectron = ['node_modules', 'electron-prebuilt', 'dist', 'electron'].join(path.sep)

        expect(electron).to.contain(expectedElectron)
      })
    })
  })

  describe('when the `electron-prebuilt` npm package is not installed', () => {
    let _envElectron

    before(() => {
      return setupFixture('project-empty')
    })

    beforeEach(() => {
      _envElectron = process.env.ELECTRON_PATH
    })

    afterEach(() => {
      process.env.ELECTRON_PATH = _envElectron
    })

    describe('and the `ELECTRON_PATH` environment variable is set', () => {
      it('should be the value of `ELECTRON_PATH`', () => {
        let envElectron = '/custom/path/to/nw'
        process.env.ELECTRON_PATH = envElectron

        let nw = findElectron()
        expect(nw).to.equal(envElectron)
      })
    })

    describe('and the `ELECTRON_PATH` environment variable is not set', () => {
      it('should be `electron`', () => {
        delete process.env.ELECTRON_PATH

        let electron = findElectron()
        expect(electron).to.equal('Electron')
      })
    })
  })
})
