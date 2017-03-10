/* jshint node: true */
'use strict';

let fs = require('fs');
let path = require('path');

function injectScript(scriptName) {
  let dirname = __dirname || path.resolve(path.dirname());
  let filePath = path.join(dirname, 'lib', 'resources', scriptName);
  let fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });

  return `<script>\n${fileContent}</script>`;
}

module.exports = {
  name: 'ember-electron',

  included(app) {
    this._super.included(app);

    if (!process.env.EMBER_CLI_ELECTRON) {
      return;
    }

    if (app.env === 'development') {
      app.import('vendor/electron/reload.js');
    }
  },

  includedCommands() {
    return {
      'electron': require('./lib/commands/electron'),
      'electron:test': require('./lib/commands/electron-test'),
      'electron:package': require('./lib/commands/package'),
      'electron:make': require('./lib/commands/make'),
    };
  },

  treeForVendor() {
    let dirname = __dirname || path.resolve(path.dirname());

    return path.join(dirname, 'app');
  },

  postprocessTree(type, tree) {
    if (!process.env.EMBER_CLI_ELECTRON) {
      return tree;
    }

    if (type === 'all' && process.env.EMBER_ENV === 'test') {
      let trees = [tree];

      let funnel = require('broccoli-funnel');
      let mergeTrees = require('broccoli-merge-trees');

      // Copy package.json and electron.js from tests/, and any other
      // files in the root package.json's copy-files. This allows the
      // app's test/electron.js to share modules with the app's
      // /electron.js in case the tests rely on some main-process
      // functionality.
      // FIXME: Modify to eliminate use of `copy-files` config; see GH issue #123
      let config = this.project.pkg.config || {};
      let ee = config['ember-electron'] || {};
      let copyFiles = ee['copy-files'] || [];
      let include = ['tests/package.json', 'tests/electron.js'];
      for (let i = 0; i < copyFiles.length; i++) {
        if (copyFiles[i] !== 'package.json' && copyFiles[i] !== 'ember-electron/electron.js') {
          include.push(copyFiles[i]);
        }
      }

      trees.push(funnel('.', {
        include,
        destDir: '/',
      }));

      return mergeTrees(trees, {
        overwrite: true,
      });
    }

    return tree;
  },

  contentFor(type) {
    const { env: { EMBER_CLI_ELECTRON } } = process;

    if (EMBER_CLI_ELECTRON) {
      if (type === 'body-footer') {
        return injectScript('shim-footer.js');
      }

      if (type === 'head') {
        return injectScript('shim-head.js');
      }
    }
  },
};
