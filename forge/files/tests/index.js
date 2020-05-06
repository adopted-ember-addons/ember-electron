const { app } = require('electron');
const { default: installExtension, EMBER_INSPECTOR } = require('electron-devtools-installer');

app.on('ready', function onReady() {
  installExtension(EMBER_INSPECTOR)
    .catch((err) => console.log('An error occurred: ', err));
});

require('ember-electron/lib/test-support/test-index');
