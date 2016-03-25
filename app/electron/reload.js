/* jshint browser: true */
(function() {
    'use strict';

    // Exit immediately if we're not running in Electron
    if (!window.ELECTRON) {
        return;
    }

    // Reload the page when anything in `dist` changes
    const fs = window.requireNode('fs');
    let watch = function(sub) {
        let dirname = __dirname;
        if (sub) { dirname += sub; }
        fs.watch(dirname, {recursive: true}, function (e) {
            window.location.reload()
        });
    }
    fs.stat(__dirname, function (err, stat) {
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
})();
