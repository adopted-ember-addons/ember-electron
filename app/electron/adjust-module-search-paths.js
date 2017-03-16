(function() {
  if (!window.ELECTRON) {
    return;
  }

  var fs = window.requireNode('fs');
  var path = window.requireNode('path');
  var module = window.requireNode('module');

  var pathsToAdd = [
    path.join(window.processNode.cwd(), 'node_modules'),
    path.resolve(window.processNode.resourcesPath, 'app', 'node_modules')
  ];

  // n.b. if we are running in `electron-prebuilt-compile`,
  // TODO @jacobq is this still necessary given window.processNoce.cwd() above?
  //      - if so, plz explain what __dirname is, why you're slicing, etc
  var epcIndex = __dirname.indexOf('electron-prebuilt-compile');
  if (epcIndex !== -1) {
    pathsToAdd.push(__dirname.slice(0, epcIndex));
  }

  pathsToAdd.forEach(function(pathToAdd) {
    try {
      // n.b. use statSync to prevent race conditions
      var stats = fs.statSync(pathToAdd);

      // TODO @jacobq explain why you are setting globalPaths vs paths
      if (stats.isDirectory() && module.globalPaths.indexOf(pathToAdd) === -1) {
        module.globalPaths.push(pathToAdd);
      }
    } catch(e) {
      // n.b. ignore "dir does not exist" errors, else throw
      if (e.code !== 'ENOENT') {
        throw e;
      }
    }
  });
}());
