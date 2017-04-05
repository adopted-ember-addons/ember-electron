function setupLivereload() {
  const process = window ? window.process : null;

  // Exit immediately if we're not running in Electron
  if (!window.ELECTRON || (process && process.env && process.env.DO_NOT_SETUP_LIVERELOAD)) {
    return;
  }

  // Reload the page when anything in `dist` changes
  let fs;
  let path;
  let devtron;

  try {
    fs = window.requireNode('fs');
    path = window.requireNode('path');
  } catch(e) {
    console.warn('ember-electron tried to require fs and path to enable live-reload features, but failed.');
    console.warn('Automatic reloading is therefore disabled.');
    console.warn(e);

    return;
  }


  /**
   * @private
   * Watch a given directory for changes and reload
   * on change
   *
   * @param sub directory
   */
  let watch = function(...sub) {
    let dirname = path.join(__dirname, ...sub);

    fs.watch(dirname, { recursive: true }, () => window.location.reload());
  };

  /**
   * @private
   * Install Devtron in the current window.
   */
  let installDevtron = function() {
    try {
      devtron = window.requireNode('devtron');

      if (devtron) {
        devtron.install();
      }
    } catch(e) {
      // no-op
    }
  };

  /**
   * @private
   * Install Ember-Inspector in the current window.
   */
  let installEmberInspector = function() {
    let location = path.join(__dirname, 'node_modules', 'ember-inspector', 'dist', 'chrome');

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
    let dirname = __dirname || (process && (process || {}).cwd) ? process.cwd() : null;

    if (!dirname) {
      return;
    }

    fs.stat(dirname, (err/* , stat */) => {
      if (!err) {
        watch();

        // On linux, the recursive `watch` command is not fully supported:
        // https://nodejs.org/docs/latest/api/fs.html#fs_fs_watch_filename_options_listener
        //
        // However, the recursive option WILL watch direct children of the
        // given directory.  So, this hack just manually sets up watches on
        // the expected subdirs -- that is, `assets` and `tests`.
        if (process && process.platform === 'linux') {
          watch('assets');
          watch('tests');
        }
      }
    });

    installDevtron();
    installEmberInspector();
  });
}

setupLivereload();
