// ember-electron
((win) => {
  win.ELECTRON = true;

  // Store electrons node environment injections for later usage
  win.moduleNode = win.module;
  win.processNode = win.process;
  win.requireNode = win.require;

  // Delete the originals so Ember is not confused
  delete win.module;
  delete win.process;
  delete win.require;
})(window);
