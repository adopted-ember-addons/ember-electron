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

        console.error(error); // eslint-disable-line no-console
      }
    };

    // Both Ember's and Node's require() have some properties (e.g. Ember's has
    // require.has() and Node's has require.resolve()). Fortunately there are no
    // naming conflicts, so we can expose them all.
    Object.assign(win.require, requireNode, requireAMD);
  } else {
    win.require = requireNode;
  }
})(window);
