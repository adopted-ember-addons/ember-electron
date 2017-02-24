// eslint-disable ember-suave/prefer-destructuring

(function() {
  if (!window.ELECTRON) {
    return;
  }

  // Restore Electron variables.
  window.process = window.processNode;

  // Redefine a global `require` function that can satisfy both
  // Node and AMD module systems.
  const requireAMD = window.require;
  const requireNode = window.requireNode;

  if (requireAMD) {
    window.require = function() {
      try {
        return requireAMD(...arguments);
      } catch(e) {
        if (e.toString().includes('Error: Could not find module')) {
          return requireNode(...arguments);
        } else {
          return console.error(e);
        }
      }
    };
  } else {
    window.require = requireNode;
  }
})();
