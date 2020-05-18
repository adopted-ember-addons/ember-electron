const { protocol } = require('electron');
const { fileURLToPath } = require('url');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const access = promisify(fs.access);

//
// Patch asset loading -- Ember apps use absolute paths to reference their
// assets, e.g. `<img src="/images/foo.jpg">`. When the current URL is a `file:`
// URL, that ends up resolving to the absolute filesystem path `/images/foo.jpg`
// rather than being relative to the root of the Ember app. So, we intercept
// `file:` URL request and look to see if they point to an asset when
// interpreted as being relative to the root of the Ember app. If so, we return
// that path, and if not we leave them as-is, as their absolute path.
//
module.exports = function handleFileURLs(emberAppDir) {
  protocol.interceptFileProtocol('file', async ({ url }, callback) => {
    let urlPath = fileURLToPath(url);
    let appPath = path.join(emberAppDir, urlPath);
    try {
      await access(appPath);
      callback(appPath);
    } catch (e) {
      callback(urlPath);
    }
  });
};