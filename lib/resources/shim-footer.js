// ember-electron
((win) => {
  // Restore process and module
  win.process = win.processNode;
  win.module = win.moduleNode;
})(window);
