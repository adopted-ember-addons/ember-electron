/* jshint browser: true */
(function() {
    'use strict';

    // Exit immediately if we're not running in Electron
    if (!window.ELECTRON) {
        return;
    }

    // Reload the page when anything in `dist` changes
    const fs = window.requireNode('fs');

    fs.stat('./dist', (err, stat) => {
        if (!err) {
            fs.watch('./dist', () => window.location.reload());
        }
    });
})();
