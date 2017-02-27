/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');

function injectScript(scriptName) {
    var dirname = __dirname || path.resolve(path.dirname());
    var filePath = path.join(dirname, 'lib', 'resources', scriptName);
    return '<script>\n' + fs.readFileSync(filePath, {
            encoding: 'utf8'
        }) + '\n</script>';
}

module.exports = {
    name: 'ember-electron',

    included: function(app) {
        this._super.included(app);

        if (!process.env.EMBER_CLI_ELECTRON) {
            return;
        }

        if (app.env === 'development') {
            app.import('vendor/electron/reload.js');
        }
    },

    includedCommands: function() {
        return {
            'electron': require('./lib/commands/electron'),
            'electron:test': require('./lib/commands/electron-test'),
            'electron:package': require('./lib/commands/package'),
            'electron:make': require('./lib/commands/make')
        };
    },

    treeForVendor: function() {
        var dirname = __dirname || path.resolve(path.dirname());
        return path.join(dirname, 'app');
    },

    postprocessTree: function(type, tree) {
        if (!process.env.EMBER_CLI_ELECTRON) {
            return tree;
        }

        if (type === 'all' && process.env.EMBER_ENV === 'test') {
            var trees = [tree];

            var funnel = require('broccoli-funnel');
            var mergeTrees = require('broccoli-merge-trees');

            // Copy package.json and electron.js from tests/, and any other
            // files in the root package.json's copy-files. This allows the
            // app's test/electron.js to share modules with the app's
            // /electron.js in case the tests rely on some main-process
            // functionality.
            var ee = this.project.pkg['ember-electron'] || {};
            var copyFiles = ee['copy-files'] || [];
            var include = ['tests/package.json', 'tests/electron.js'];
            for (var i = 0; i < copyFiles.length; i++) {
                if (copyFiles[i] !== 'package.json' && copyFiles[i] !== 'electron.js') {
                    include.push(copyFiles[i]);
                }
            }

            trees.push(funnel('.', {
                include: include,
                destDir: '/'
            }));

            return mergeTrees(trees, {
                overwrite: true
            });
        }

        return tree;
    },

    contentFor: function(type) {
        if (type === 'head') {
            return injectScript('shim-head.js');
        }

        if (type === 'body-footer') {
            return injectScript('shim-footer.js');
        }
    }
};
