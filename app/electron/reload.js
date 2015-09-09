/* jshint browser: true */
(function () {
    // Exit immediately if we're not running in Electron
    if (!window.ELECTRON) {
        return;
    }

    // Reload the page when anything in `dist` changes
    var fs = window.requireNode('fs');
    var watchDir = './dist';

    if (fs.existsSync(watchDir)) {
        fs.watch(watchDir, function () {
            window.location.reload();
        });
    }
})();