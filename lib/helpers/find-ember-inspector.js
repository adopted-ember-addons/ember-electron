var fs      = require('fs');
var path    = require('path');

module.exports = function () {
    var base = path.join('ember-inspector', 'dist', 'websocket');

    // npm3 installs packages flat
    var npm2path = path.join(__dirname, '..', '..', 'node_modules', base);
    var npm3path = path.join(__dirname, '..', '..', '..', 'node_modules', base);
    var npm2exists, npm3exists;

    try {
        npm2exists = !!fs.statSync(npm2path);
    } catch (e) {
        // No-op, we're just catching the "file not found" error
    }

    try {
        npm3exists = !!fs.statSync(npm3path);
    } catch (e) {
        // No-op, we're just catching the "file not found" error
    }

    if (npm2exists) {
        return npm2path;
    }

    if (npm3exists) {
        return npm3path;
    }

    return new Error('Ember Inspector not found!');
};
