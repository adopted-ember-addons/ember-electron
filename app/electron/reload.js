/* jshint browser: true */
(function() {
    'use strict';

    // Exit immediately if we're not running in Electron
    if (!window.ELECTRON) {
        return;
    }

    // Reload the page when anything in `dist` changes
    const fs = window.requireNode('fs');
    fs.stat(__dirname, (err, stat) => {
        if (!err) {
            fs.watch(__dirname, {recursive: true}, (e) => {
                window.location.reload()
            });
        }
    });
})();
