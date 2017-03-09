// ember-electron
((win) => {
  const { requireNode, require: requireAMD } = win;

  // Redefine a global `require` function that can satisfy both Node and AMD module systems.
  if (requireAMD) {
    win.require = (...args) => {
      try {
        return requireAMD(...args);
      } catch(error) {
        if (error.toString().includes('Error: Could not find module')) {
          return requireNode(...args);
        }

        console.error(error);
      }
    };
  } else {
    win.require = requireNode;
  }

  // Restore others
  win.process = win.processNode;
  win.module = win.moduleNode;
})(window);
