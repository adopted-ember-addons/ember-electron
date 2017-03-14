(() => {
  // Exit immediately if we're not running in Electron
  if (!window.ELECTRON) {
    return;
  }

  // Reload the page when anything in `dist` changes
  let fs = window.requireNode('fs');
  let path = window.requireNode('path');

  /**
   * @private
   * Watch a given directory for changes and reload
   * on change
   *
   * @param sub directory
   */
  let watch = function(sub) {
    let dirname = __dirname || process.cwd();
    let isInTest = !!window.QUnit;

    if (isInTest) {
      // In tests, __dirname is `<project>/tmp/<broccoli-dist-path>/tests`.
      // In normal `ember:electron` it's `<project>/dist`.
      // To achieve the regular behavior in testing, go to parent dir, which contains `tests` and `assets`
      dirname = path.join(dirname, '..');
    }

    if (sub) {
      dirname = path.join(dirname, sub);
    }

    fs.watch(dirname, { recursive: true }, () => window.location.reload());
  };

  /**
   * @private
   * Install Devtron in the current window.
   */
  let installDevtron = function() {
    let devtron = window.requireNode('devtron');

    if (devtron) {
      devtron.install();
    }
  };

  /**
   * @private
   * Install Ember-Inspector in the current window.
   */
  let installEmberInspector = function() {
    let location = path.join('node_modules', 'ember-inspector', 'dist', 'chrome');

    fs.lstat(location, (err, results) => {
      if (err) {
        return;
      }

      if (results && results.isDirectory && results.isDirectory()) {
        let { BrowserWindow } = window.requireNode('electron').remote;
        let added = BrowserWindow.getDevToolsExtensions
          && BrowserWindow.getDevToolsExtensions().hasOwnProperty('Ember Inspector');

        try {
          if (!added) {
            BrowserWindow.addDevToolsExtension(location);
          }
        } catch(err) {
          // no-op
        }
      }
    });
  };

  document.addEventListener('DOMContentLoaded', (/* e */) => {
    let dirname = __dirname || process.cwd();

    fs.stat(dirname, (err/* , stat */) => {
      if (!err) {
        watch();

        // On linux, the recursive `watch` command is not fully supported:
        // https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener
        //
        // However, the recursive option WILL watch direct children of the
        // given directory.  So, this hack just manually sets up watches on
        // the expected subdirs -- that is, `assets` and `tests`.
        if (process.platform === 'linux') {
          watch('/assets');
          watch('/tests');
        }
      }
    });

    installDevtron();
    installEmberInspector();
  });
})();
