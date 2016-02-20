'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

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

module.exports = function (project) {
    const electronLocalPath = path.resolve(project.root, 'node_modules/electron-prebuilt/dist/');
    let electron;

    if (fs.existsSync(electronLocalPath)) {
        electron = getLocalElectron(electronLocalPath);
    } else if (process.env.ELECTRON_PATH) {
        electron = process.env.ELECTRON_PATH;
    } else {
        electron = 'Electron';
    }

    return electron;
};
