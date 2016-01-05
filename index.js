/* jshint node: true */
'use strict';

var fs = require('fs');
var path = require('path');

function injectScript(scriptName) {
    var filePath = path.join(__dirname, 'lib', 'resources', scriptName);
    return '<script>\n' + fs.readFileSync(filePath, {
        encoding: 'utf8'
    }) + '\n</script>';
}

module.exports = {
    name: 'ember-electron',

    included: function (app) {
        this._super.included(app);

        if (!process.env.EMBER_CLI_ELECTRON) {
            return;
        }

        app.import({
            development: 'vendor/electron/reload.js'
        });
        if (process.env.ELECTRON_TESTS_DEV) {
            app.import({
                test: 'vendor/electron/browser-qunit-adapter.js'
            });
        } else {
            app.import({
                test: 'vendor/electron/tap-qunit-adapter.js'
            });
        }
    },

    includedCommands: function () {
        return {
            'electron': require('./lib/commands/electron'),
            'electron:test': require('./lib/commands/electron-test'),
            'electron:package': require('./lib/commands/package')
        };
    },

    treeForVendor: function () {
        return path.join(__dirname, 'app');
    },

    postprocessTree: function (type, tree) {
        if (!process.env.EMBER_CLI_ELECTRON) {
            return tree;
        }

        if (type === 'all' && process.env.EMBER_ENV === 'test') {
            var funnel = require('broccoli-funnel');
            var mergeTrees = require('broccoli-merge-trees');
            var replace = require('broccoli-string-replace');

            // Update the base URL in `tests/index.html`
            var index = replace(tree, {
                files: ['tests/index.html'],
                pattern: {
                    match: /base href="\/"/,
                    replacement: 'base href="../"'
                }
            });

            // Copy `tests/package.json` to the output directory
            var testPkg = funnel('tests', {
                files: ['package.json', 'electron.js'],
                destDir: '/tests'
            });

            var testPageOptions = process.env.ELECTRON_TEST_PAGE_OPTIONS;

            if (testPageOptions) {
                testPkg = replace(testPkg, {
                    files: ['tests/electron.js'],
                    patterns: [{
                        match: /index.html/,
                        replacement: '"index.html?' + testPageOptions + '"'
                    }]
                });
            }

            return mergeTrees([tree, index, testPkg], {
                overwrite: true
            });
        }

        return tree;
    },

    contentFor: function (type) {
        if (type === 'head') {
            return injectScript('shim-head.js');
        }

        if (type === 'body-footer') {
            return injectScript('shim-footer.js');
        }

        if (type === 'test-body' && process.env.EMBER_ENV === 'test') {
            var testemServer = process.env.ELECTRON_TESTEM_SERVER_URL;
            if (testemServer) {
                return '<script src="' + testemServer + '/socket.io/socket.io.js"></script>';
            }
        }
    }
};