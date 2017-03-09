/* jshint node: true */
'use strict';

let fs = require('fs');
let path = require('path');
let { clone } = require('lodash/lang');

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

    if (type === 'all') {
      //
      // Copy our files to assemble our electron and ember apps. Our directory
      // structure inside our build output dir (dist/ or temp directory) is
      // going to end up looking like this:
      //
      // .
      // ├── package.json
      // ├── .compilerc
      // ├── <any other files/directories found in ember-electron, except resources-*>
      // ├── resources
      // │   ├── <file copied/merged from resources and resources-<platform>>
      // │   ├── <file copied/merged from resources and resources-<platform>>
      // │   └── ...
      // └── ember
      //     └── <ember build output>
      //
      let funnel = require('broccoli-funnel');
      let writeFile = require('broccoli-file-creator');
      let mergeTrees = require('broccoli-merge-trees');
      let platform = process.env.EMBER_CLI_ELECTRON_BUILD_PLATFORM || process.platform;

      // We don't want to assume that our host package has a main entry that
      // makes any sense for our packaged electron app, so let's just set it to
      // be `index.js`.
      let packageJson = clone(this.project.pkg);
      packageJson.main = 'lib/index.js';

      let trees = [
        // write package.json
        writeFile('package.json', JSON.stringify(packageJson, null, '  ')),
        // copy the rest of the ember-electron directory, with the exception of
        // the resources directories that need to be merged
        funnel('ember-electron', {
          exclude: ['resources', 'resources-*'],
        }),
        // copy resources
        funnel('ember-electron', {
          srcDir: 'resources',
          destDir: 'resources',
          allowEmpty: true,
        }),
        funnel('ember-electron', {
          srcDir: `resources-${platform}`,
          destDir: 'resources',
          allowEmpty: true,
        }),
        // copy ember build output
        funnel(tree, {
          destDir: 'ember',
        }),
      ];

      if (process.env.EMBER_ENV === 'test') {
        // Overwrite index.js with test index.js
        trees.push(funnel('tests/ember-electron', {
          files: ['lib/index.js'],
        }));
      }

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
