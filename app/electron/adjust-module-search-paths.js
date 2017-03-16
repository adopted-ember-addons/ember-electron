(function() {
  if (!window.ELECTRON) {
    return;
  }

  var fs = window.requireNode('fs');
  var path = window.requireNode('path');
  var module = window.requireNode('module');

  var searchPaths = window.processNode.mainModule.paths;
  var packagedNodeModulesPath = path.resolve(window.processNode.resourcesPath, 'app', 'node_modules');
  var projectRootNodeModulesPath = (function() {
    // n.b. if we are using `electron-prebuilt-compile` seek top-level node_modules dir
    var epcIndex = __dirname.indexOf('electron-prebuilt-compile');
    if (epcIndex !== -1) {
      return __dirname.slice(0, epcIndex);
    }
  }());

  var pathsToAdd = [packagedNodeModulesPath];
  if (projectRootNodeModulesPath) {
    pathsToAdd.push(projectRootNodeModulesPath);
  }

  pathsToAdd.forEach(function(pathToAdd) {
    try {
      // n.b. use statSync to prevent race conditions
      var stats = fs.statSync(pathToAdd);

      if (stats.isDirectory() && searchPaths.indexOf(pathToAdd) === -1) {
        searchPaths.push(pathToAdd);
      }
    } catch(e) {
      // n.b. ignore "dir does not exist" errors (app may not be packaged)
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  });
}());
