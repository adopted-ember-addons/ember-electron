const { app, BrowserWindow, protocol } = require('electron');
const { dirname, resolve } = require('path');
const url = require('url');
const protocolEmber = require('./protocol-ember.js');

let mainWindow = null;

// The testUrl is a file: url pointing to our index.html, with some query
// params we need to preserve for testem. So we need to register our ember
// protocol accordingly.
const [, , indexUrl] = process.argv;
const {
  pathname: indexPath,
  search: indexQuery,
} = url.parse(indexUrl);
const emberAppLocation = `ember://ember${indexQuery}`;

protocol.registerStandardSchemes(['ember'], { secure: true });
// The index.html is in the tests/ directory, so we want all other assets to
// load from its parent directory
protocolEmber(resolve(dirname(indexPath), '..'), indexPath);

app.on('window-all-closed', function onWindowAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function onReady() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundThrottling: false,
  });

  delete mainWindow.module;

  mainWindow.loadURL(emberAppLocation);

  mainWindow.on('closed', function onClosed() {
    mainWindow = null;
  });
});
