'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');

function getLocalElectron(electronLocalPath) {
    var platform = os.platform(),
        electron;

    if (platform === 'darwin') {
        if (fs.existsSync(path.join(electronLocalPath, 'Contents'))) {
            electron = path.join(electronLocalPath, 'Contents', 'MacOS', 'Electron');
        } else {
            electron = path.join(electronLocalPath, 'Electron.app', 'Contents', 'MacOS', 'Electron');
        }
    } else if (platform === 'win32') {
        electron = path.join(electronLocalPath, 'Electron.exe');
    } else {
        electron = path.join(electronLocalPath, 'Electron');
    }

    return electron;
}

module.exports = function (project) {
    var electronLocalPath = path.resolve(project.root, 'node_modules/electron-prebuilt/dist/Electron'),
        electron;

    if (fs.existsSync(electronLocalPath)) {
        electron = getLocalElectron(electronLocalPath);
    } else if (process.env.ELECTRON_PATH) {
        electron = process.env.ELECTRON_PATH;
    } else {
        electron = 'Electron';
    }

    return electron;
};