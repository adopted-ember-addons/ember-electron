/* jshint node: true */
'use strict';

const fs = require('fs-extra');
const path = require('path');
const { clone } = require('lodash/lang');

function injectScript(scriptName) {
  let dirname = __dirname || process.cwd();
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

    app.import('vendor/electron/adjust-module-search-paths.js');
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
    let dirname = __dirname || process.cwd();

    return path.join(dirname, 'app');
  },

  postprocessTree(type, tree) {
    if (!process.env.EMBER_CLI_ELECTRON) {
      return tree;
    }

    if (type === 'all') {
      // Copy our files to assemble our electron and ember apps. Our directory
      // structure inside our build output dir (dist/ or temp directory) is
      // going to end up looking like this:
      //
      // ├── package.json
      // ├── .compilerc
      // ├── ember
      // │   ├── <ember build output>
      // ├── ember-electron
      //     ├── .electron-forge
      //     ├── index.js
      //     ├── resources
      //         ├── <file copied/merged from resources and resources-<platform>>
      //         ├── <file copied/merged from resources and resources-<platform>>
      //
      const funnel = require('broccoli-funnel');
      const writeFile = require('broccoli-file-creator');
      const mergeTrees = require('broccoli-merge-trees');

      let platform = process.env.EMBER_CLI_ELECTRON_BUILD_PLATFORM || process.platform;
      let packageJson = clone(this.project.pkg);

      let emberElectronPath = path.join(this.project.root, 'ember-electron');
      let compileRcPath = path.join(emberElectronPath, '.compilerc');

      packageJson.main = 'ember-electron/index.js';

      let trees = [
        writeFile('package.json', JSON.stringify(packageJson, null, '  ')),
        writeFile('.compilerc', fs.readFileSync(compileRcPath)),

        funnel('ember-electron', {
          destDir: 'ember-electron',
          exclude: [
            '.compilerc',
            'resources*/**',
            'resources*/**/.*',
          ],
        }),

        funnel('ember-electron', {
          srcDir: 'resources',
          destDir: 'ember-electron/resources',
          allowEmpty: true,
        }),

        funnel('ember-electron', {
          srcDir: `resources-${platform}`,
          destDir: 'ember-electron/resources',
          allowEmpty: true,
        }),

        funnel(tree, {
          destDir: 'ember',
        }),
      ];

      if (process.env.EMBER_ENV === 'test') {
        // Overwrite index.js with test index.js
        trees.push(funnel('tests/ember-electron', {
          files: ['index.js'],
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
