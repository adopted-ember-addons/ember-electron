'use strict'

const path = require('path')
const mockery = require('mockery')
const expect = require('../../helpers/expect')

describe('electron-finder', () => {
  let fixturePath

  before(() => {
    fixturePath = path.resolve(__dirname, '..', '..', 'fixtures')
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
      let findElectron

      before(() => {
        mockery.registerMock('os', {
          platform: function () {
            return 'darwin'
          }
        })

        findElectron = require('../../../lib/helpers/find-electron')
      })

      after(() => {
        mockery.deregisterMock('os')
        mockery.resetCache()
      })

      it('should be `node_modules/electron-prebuilt/dist/Electron.app/Contents/MacOS/Electron`', function () {
        let project = {
          root: path.join(fixturePath, 'project-darwin')
        }

        let electron = findElectron(project)
        let expectedElectron = ['node_modules', 'electron-prebuilt', 'dist', 'Electron.app', 'Contents', 'MacOS', 'Electron'].join(path.sep)

        expect(electron).to.contain(expectedElectron)
      })
    })

    describe('and the platform is Windows', () => {
      let findElectron

      before(() => {
        mockery.registerMock('os', {
          platform: function () {
            return 'win32'
          }
        })

        findElectron = require('../../../lib/helpers/find-electron')
      })

      after(() => {
        mockery.deregisterMock('os')
        mockery.resetCache()
      })

      it('should be `node_modules/electron/electronjs/electron.exe`', () => {
        let project = {
          root: path.join(fixturePath, 'project-win32')
        }

        let electron = findElectron(project)
        let expectedElectron = ['node_modules', 'electron-prebuilt', 'dist', 'electron.exe'].join(path.sep)

        expect(electron).to.contain(expectedElectron)
      })
    })

    describe('and the platform is not Mac or Windows (aka Linux)', () => {
      let findElectron

      before(() => {
        mockery.registerMock('os', {
          platform: function () {
            return 'linux'
          }
        })

        findElectron = require('../../../lib/helpers/find-electron')
      })

      after(() => {
        mockery.deregisterMock('os')
        mockery.resetCache()
      })

      it('should be `node_modules/electron-prebuilt/dist/electron`', () => {
        let project = {
          root: path.join(fixturePath, 'project-linux')
        }

        let electron = findElectron(project)
        let expectedElectron = ['node_modules', 'electron-prebuilt', 'dist', 'electron'].join(path.sep)

        expect(electron).to.contain(expectedElectron)
      })
    })
  })

  describe('when the `electron-prebuilt` npm package is not installed', () => {
    let findElectron, _envElectron

    before(() => {
      findElectron = require('../../../lib/helpers/find-electron')
    })

    beforeEach(() => {
      _envElectron = process.env.ELECTRON_PATH
    })

    afterEach(() => {
      process.env.ELECTRON_PATH = _envElectron
    })

    describe('and the `ELECTRON_PATH` environment variable is set', () => {
      it('should be the value of `ELECTRON_PATH`', () => {
        let project = {
          root: path.join(fixturePath, 'project-empty')
        }

        let envElectron = '/custom/path/to/nw'
        process.env.ELECTRON_PATH = envElectron

        let nw = findElectron(project)
        expect(nw).to.equal(envElectron)
      })
    })

    describe('and the `ELECTRON_PATH` environment variable is not set', () => {
      it('should be `electron`', () => {
        let project = {
          root: path.join(fixturePath, 'project-empty')
        }

        delete process.env.ELECTRON_PATH

        let electron = findElectron(project)
        expect(electron).to.equal('Electron')
      })
    })
  })
})
