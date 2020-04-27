// Make sure dependencies (node_modules) are loadable
const fileUrl = require('file-url');
fileUrl('foo.html');
// Make sure local libraries are loadable
const helper = require('../src/helper');
helper();

const { app, BrowserWindow } = require('electron');

app.once('browser-window-created', (event, win) => {
  win.webContents.on('did-finish-load', () => {
    let extensions = BrowserWindow.getDevToolsExtensions();
    if (!Object.prototype.hasOwnProperty.call(extensions, 'devtron') || !Object.prototype.hasOwnProperty.call(extensions, 'Ember Inspector')) {
      console.error('devtron and/or ember-inspector not installed', Object.keys(extensions)); // eslint-disable-line no-console
      app.exit(-1);
    }
  });
});
