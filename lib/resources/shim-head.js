// ember-electron
((win) => {
  win.ELECTRON = true;

  // On linux the renderer process doesn't inherit the main process'
  // environment, so we need to fall back to using the remote module.
  const serveIndex = process.env.ELECTRON_PROTOCOL_SERVE_INDEX || require('electron').remote.process.env.ELECTRON_PROTOCOL_SERVE_INDEX;

  if (serveIndex && window.location.protocol !== 'file:') {
    // Using electron-protocol-serve to load index.html via a 'serve:' URL
    // prevents electron's renderer/init.js from setting the module search
    // paths correctly. So this is basically a copy of that code, but using an
    // environment variable set by electron-protocol-serve containing the
    // filesystem path to index.html instead of window.location.
    const path = require('path');
    const Module = require('module');

    global.__filename = path.normalize(serveIndex);
    global.__dirname = path.dirname(serveIndex);

    // Set module's filename so relative require can work as expected.
    module.filename = global.__filename;

    // Also search for module under the html file.
    module.paths = module.paths.concat(Module._nodeModulePaths(global.__dirname));
  }

  // Store electrons node environment injections for later usage
  win.moduleNode = win.module;
  win.processNode = win.process;
  win.requireNode = win.require;

  // Delete the originals so Ember is not confused
  delete win.module;
  delete win.process;
  delete win.require;
})(window);
