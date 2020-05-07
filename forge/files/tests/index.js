const { default: installExtension, EMBER_INSPECTOR } = require('electron-devtools-installer');

require('electron').app.on('ready', function onReady() {
  require('devtron').install();
  installExtension(EMBER_INSPECTOR)
    .catch((err) => console.log('An error occurred: ', err));
});

require('ember-electron/lib/test-support/test-index');
