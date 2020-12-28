const { session, BrowserWindow } = require('electron');
const { URL, pathToFileURL } = require('url');

// These are the command-line arguments passed to us by test-runner.js
const [ , , , testPageURL, testemURL, testemId ] = process.argv;

// Set up communication with the testem server
//
// We broccoli'ed the src attribute in the script tag that loads testem.js to be
// http://testemserver/testem.js, so it and every resource it loads will have a
// base URL of http://testemserver. The test runner passes us the URL to the
// actual testem server, so we can intercept any requests to http://testemserver
// and redirect them to the actual testem server.
function setupTestem() {
  let { host: testemHost } = new URL(testemURL);

  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    let urlObj = new URL(details.url);
    let { hostname } = urlObj;

    if (hostname === 'testemserver') {
      urlObj.host = testemHost;
      callback({ redirectURL: urlObj.toString() });
    } else {
      callback({});
    }
  });
}

// Open the test window. `emberAppDir` is the path to the directory containing
// the built Ember app that we are testing
function openTestWindow(emberAppDir) {
  let window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      backgroundThrottling: false,
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  delete window.module;

  // Convert the emberAppDir to a file URL and append a '/' so when it's joined
  // with the testPageURL the last path component isn't dropped
  let url = new URL(testPageURL, `${pathToFileURL(emberAppDir)}/`);

  // We need to set this query param so the script in shim-test-head.js can
  // expose it to testem to use when communicating with the testem server
  url.searchParams.set('testemId', testemId);

  // https://github.com/nodejs/node/issues/9500
  for (let [ key, value ] of url.searchParams.entries()) {
    if ([ null, undefined, '' ].includes(value)) {
      url.searchParams.set(key, 'true');
    }
  }

  window.loadURL(url.toString());
}

module.exports = {
  setupTestem,
  openTestWindow
}
