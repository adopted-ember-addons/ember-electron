// This gets pasted into the test index file, so put our code inside a function
// to make sure we don't have naming conflicts with already-declared variables
function testIndexExtra() {
  // Make sure dependencies (node_modules) are loadable
  require('electron-is-dev');

  // Make sure local libraries are loadable
  const helper = require('../src/helper');
  helper();

  // disabled until there's a fix for https://github.com/electron/electron/issues/23676
  // and ideally for https://github.com/electron/electron/issues/23656
  //
  // const { app, BrowserWindow } = require('electron');
  //
  // app.once('browser-window-created', (event, win) => {
  //   win.webContents.on('did-finish-load', () => {
  //     let extensions = BrowserWindow.getDevToolsExtensions();
  //     if (!Object.prototype.hasOwnProperty.call(extensions, 'devtron') || !Object.prototype.hasOwnProperty.call(extensions, 'Ember Inspector')) {
  //       console.error('devtron and/or ember-inspector not installed', Object.keys(extensions)); // eslint-disable-line no-console
  //       app.exit(-1);
  //     }
  //   });
  // });
}

testIndexExtra();
