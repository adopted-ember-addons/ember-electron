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

      // We want to copy all of the files listed in copy-files to the output
      // tests directory, but we want to overwrite package.json and
      // ember-electron/electron.js with the versions from our tests/ directory
      let config = this.project.pkg.config || {};
      let ee = config['ember-electron'] || {};
      let copyFiles = ee['copy-files'] || [];

      trees.push(funnel('.', {
        include: copyFiles,
        destDir: '/tests',
      }));

      trees.push(funnel('tests', {
        include: ['package.json', 'ember-electron/electron.js'],
        destDir: '/tests',
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
