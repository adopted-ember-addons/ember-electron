const { default: installExtension, EMBER_INSPECTOR } = require('electron-devtools-installer');
const path = require('path');
const { app } = require('electron');
const setupServeProtocol = require('../src/setup-serve-protocol');
const { setupTestem, openTestWindow } = require('ember-electron/lib/test-support');

const emberAppDir = path.resolve(__dirname, '..', 'ember-test');

setupServeProtocol(emberAppDir);

app.on('ready', async function onReady() {
  try {
    require('devtron').install();
  } catch (err) {
    console.log('Failed to install Devtrom: ', err);
  }
  try {
    await installExtension(EMBER_INSPECTOR);
  } catch (err) {
    console.log('Failed to install Ember Inspector: ', err)
  }

  setupTestem();
  openTestWindow();
});

app.on('window-all-closed', function onWindowAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
