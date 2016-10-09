'use strict'

const path = require('path')
const os = require('os')
const dirExists = require('./directory-exists')

function getLocalElectron (electronLocalPath) {
  const platform = os.platform()

  if (platform === 'darwin') {
    return path.join(electronLocalPath, 'Electron.app', 'Contents', 'MacOS', 'Electron')
  }

  if (platform === 'win32') {
    return path.join(electronLocalPath, 'electron.exe')
  }

  return path.join(electronLocalPath, 'electron')
}

module.exports = function (project) {
  const localElectrons = {
    electron: {
      path: path.resolve(project.root, 'node_modules/electron-prebuilt/dist/'),
      exists: null
    },
    prebuilt: {
      path: path.resolve(project.root, 'node_modules/electron/dist/'),
      exists: null
    }
  }

  localElectrons.electron.exists = dirExists(localElectrons.electron.path)
  localElectrons.prebuilt.exists = dirExists(localElectrons.prebuilt.path)

  let electron

  if (localElectrons.electron.exists) {
    electron = getLocalElectron(localElectrons.electron.path)
  } else if (localElectrons.prebuilt.exists) {
    electron = getLocalElectron(localElectrons.prebuilt.path)
  } else if (process.env.ELECTRON_PATH) {
    electron = process.env.ELECTRON_PATH
  } else {
    electron = 'Electron'
  }

  return electron
}
