// This function needs to be ES5 compatible since it may otherwise cause `uglify` to choke
(function() {
  // Exit immediately if we're not running in Electron
  if (!window.ELECTRON) {
    return;
  }

  // Electron restricts the node_modules search path such that only modules within
  // its resources directory are allowed.
  // https://github.com/electron/electron/blob/master/lib/common/reset-search-paths.js
  //
  // Unfortunately, during development a pre-built electron setup might be used and
  // have its resources folder in some other folder than the app being served.
  // To work around this we can add these paths back into the global list.
  //
  // Note: This should probably be handled upstream in electron-prebuilt-compiler

  var fs = window.requireNode('fs');
  var path = window.requireNode('path');
  var module = window.requireNode('module');

  var pathsToAdd = [];

  // Check if we're running with resource root inside of a `electron-prebuilt-compile` dir.
  // This should correspond to when running `ember electron`
  var epcIndex = __dirname.indexOf('electron-prebuilt-compile');
  if (epcIndex !== -1)
    pathsToAdd.push(__dirname.slice(0, epcIndex));

  // When running a packaged app, we have our modules in
  // resources/app/node_modules
  pathsToAdd.push(path.resolve(window.processNode.resourcesPath, 'app', 'node_modules'));

  pathsToAdd.forEach(function(pathToAdd) {
    // Note: sync version is used on purpose here since otherwise later calls to `require`
    // may fail because they need to use these paths but this hasn't finished yet.
    try {
      var stats = fs.statSync(pathToAdd);
      if (stats.isDirectory() && module.Module.globalPaths.indexOf(pathToAdd) === -1) {
        module.Module.globalPaths.push(pathToAdd);
      }
    }
    catch(e) {
      // It's OK if any of these paths don't exist; we just won't add them.
      // But if there's some other error we probably still want to know about it
      if (e.code !== 'ENOENT')
        throw e;
    }
  });
}());
