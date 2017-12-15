/* eslint-env node */
const { app, BrowserWindow, protocol, session } = require('electron');
const { dirname, resolve, relative } = require('path');
const url = require('url');
const protocolServe = require('electron-protocol-serve');

let mainWindow = null;

// The testUrl is a file: url pointing to our index.html, with some query
// params we need to preserve for testem. So we need to register our ember
// protocol accordingly.
let [, , indexUrl, testemUrl] = process.argv;
// Undo workaround for windows (see test-runner.js for explanation)
indexUrl = indexUrl.replace(/__amp__/g, '&');
let {
  pathname: indexPath,
  search: indexQuery,
} = url.parse(indexUrl);
// When we extract the pathname from an absolute path on windows, it starts
// with '/C:/', and the leading slash confuses everything, so we need to strip
// it.
if (process.platform === 'win32') {
  indexPath = indexPath.slice(1);
}

let emberAppDir = resolve(dirname(indexPath), '..');
let relPath = relative(emberAppDir, indexPath);
const emberAppLocation = `serve://dist/${relPath}${indexQuery}`;

protocol.registerStandardSchemes(['serve'], { secure: true });
protocolServe({
  cwd: emberAppDir,
  app,
  protocol,
});

app.on('window-all-closed', function onWindowAllClosed() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function onReady() {
  // Redirect the request for testem.js (which we broccoli'ed from a relative
  // serve:// URL to an http URL in assemble-tree.js) to the testemJsUrl passed
  // to us from test-runner.js
  let { host: testemHost } = url.parse(testemUrl);

  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    let urlObj = url.parse(details.url);
    let { hostname } = urlObj;

    if (hostname === 'testemserver') {
      urlObj.host = testemHost;
      callback({ redirectURL: url.format(urlObj) });
    } else {
      callback({});
    }
  });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      backgroundThrottling: false,
    },
  });

  delete mainWindow.module;

  process.env.ELECTRON_PROTOCOL_SERVE_INDEX = indexPath;
  mainWindow.loadURL(emberAppLocation);

  mainWindow.on('closed', function onClosed() {
    mainWindow = null;
  });
});
