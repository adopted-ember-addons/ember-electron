'use strict';

const path = require('path');
const os = require('os');
const dirExists = require('./directory-exists');

/**
 * Takes a path to an Electron prebuilt node_modules folder
 * (electron-prebuilt or electron) and returns the path to
 * the executable, depending on the current platform
 *
 * @param {string} electronLocalPath
 * @returns {string} Path to executable
 */
function getLocalElectron(electronLocalPath) {
  const platform = os.platform();

  if (platform === 'darwin') {
    return path.join(electronLocalPath, 'Electron.app', 'Contents', 'MacOS', 'Electron');
  }

  if (platform === 'win32') {
    return path.join(electronLocalPath, 'electron.exe');
  }

  return path.join(electronLocalPath, 'electron');
}

/**
 * Checks if electron or electron-prebuilt is installed in
 * node_modules and returns the path to the binary
 *
 * @returns {string} Path to Electron executable
 */
function getElectronApp() {
  const localElectron = getElectronPackagePath();
  let electron;

  if (localElectron) {
    electron = getLocalElectron(localElectron);
  } else if (process.env.ELECTRON_PATH) {
    electron = process.env.ELECTRON_PATH;
  } else {
    electron = 'Electron';
  }

  return electron;
}

/**
 * Checks if electron or electron-prebuilt is installed in
 * node_modules and returns the path to either package
 *
 * @returns {string} Path to local electron or electron-prebuilt
 */
function getElectronPackagePath() {
  let distPath;

  try {
    distPath = path.join(path.dirname(require.resolve('electron-prebuilt')), 'dist');
    if (dirExists(distPath)) {
      return distPath;
    }
  } catch(e) {
    //
  }

  try {
    distPath = path.join(path.dirname(require.resolve('electron')), 'dist');
    if (dirExists(distPath)) {
      return distPath;
    }
  } catch(e) {
    //
  }

  return null;
}

module.exports = {
  getElectronPackagePath,
  getLocalElectron,
  getElectronApp,
};
