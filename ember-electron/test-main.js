/* eslint-env node */
const { app, BrowserWindow, protocol } = require('electron');
const { dirname, resolve, basename } = require('path');
const fs = require('fs');
const url = require('url');
const protocolServe = require('electron-protocol-serve');
const tmp = require('tmp');

let mainWindow = null;

// The testUrl is a file: url pointing to our index.html, with some query
// params we need to preserve for testem. So we need to register our ember
// protocol accordingly.
let [, , indexUrl] = process.argv;
// Undo workaround for windows (see test-runner.js for explanation)
indexUrl = indexUrl.replace(/__amp__/g, '&');
console.log(`URL: ${indexUrl}`);
let {
  pathname: originalIndexPath,
  search: indexQuery,
} = url.parse(indexUrl);
// When we extract the pathname from an absolute path on windows, it starts
// with '/C:/', and the leading slash confuses everything, so we need to strip
// it.
if (process.platform === 'win32') {
  originalIndexPath = originalIndexPath.slice(1);
}

// Copy index-electron.html to a location not managed by broccoli so that it
// doesn't get deleted when a change is detected.
originalIndexPath = resolve(originalIndexPath);
let emberAppDir = resolve(dirname(originalIndexPath), '..');
let tmpDir = tmp.dirSync().name;
let indexPath = resolve(tmpDir, basename(originalIndexPath));
fs.writeFileSync(indexPath, fs.readFileSync(originalIndexPath, 'utf8').toString());
const emberAppLocation = `serve://dist${indexQuery}`;

protocol.registerStandardSchemes(['serve'], { secure: true });
// The index-electron.html was copied to the tmp directory, so we want all other
// assets to load from the parent directory of the original file (emberAppDir).
protocolServe({
  cwd: emberAppDir,
  app,
  protocol,
  indexPath,
});

app.on('window-all-closed', function onWindowAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function onReady() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      backgroundThrottling: false,
    },
  });

  delete mainWindow.module;

  process.env.ELECTRON_PROTOCOL_SERVE_INDEX = originalIndexPath;
  mainWindow.loadURL(emberAppLocation);

  mainWindow.on('closed', function onClosed() {
    mainWindow = null;
  });
});

let cwd = __dirname || resolve(dirname());
// Make sure dependencies (node_modules) are copied correctly and we can
// load them
const fileUrl = require('file-url');
fileUrl('foo.html');
// Make sure local libraries are copied correctly and we can load them
const helper = require('./lib/helper.js');
helper();
// Make sure local resources are copied correctly and we can read them
const { readFileSync } = require('fs');
let content = readFileSync(`${cwd}/resources/foo.txt`).toString().trim();
if (content !== 'hello') {
  throw new Error(`${cwd}/resources/foo.txt should be contain 'hello': ${content}`);
}
