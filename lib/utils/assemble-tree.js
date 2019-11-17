'use strict';
const { existsSync } = require('fs');
const Logger = require('./logger');
const { UnwatchedDir } = require('broccoli-source');
const replace = require('broccoli-string-replace');

function hasEmberWelcomePage(pkg) {
  return pkg && pkg.devDependencies && pkg.devDependencies['ember-welcome-page'];
}

//
// This is a helper to build a broccoli tree that will assemble an electron
// forge-compatible project from an Ember app. The Ember app is passed in via
// inputNode, which can either be the path to a directory containing the built
// Ember app, or a brocolli tree whose output is a built Ember app.
//
module.exports = function assembleTree({ ui, project, platform, inputNode }) {
  // Copy our files to assemble our electron and ember apps. Our directory
  // structure inside our build output dir (dist/ or temp directory) is
  // going to end up looking like this:
  //
  // ├── package.json
  // ├── ember
  // │   ├── <ember build output>
  // ├── ember-electron
  //     ├── .electron-forge
  //     ├── main.js
  //     ├── resources
  //         ├── <file copied/merged from resources and resources-<platform>>
  //         ├── <file copied/merged from resources and resources-<platform>>
  //
  const { clone } = require('lodash/lang');
  const Funnel = require('broccoli-funnel');
  const writeFile = require('broccoli-file-creator');
  const mergeTrees = require('broccoli-merge-trees');

  let packageJson = clone(project.pkg);

  if (hasEmberWelcomePage(packageJson)) {
    let logger = new Logger({ ui });

    logger.message(`
"ember-welcome-page" was detected in your devDependencies!
Please note that this addon only works in development environment
and will not render in production mode. It is safe to uninstall
this addon once you removed the {{welcome-page}} template tag.
`);
  }

  packageJson.main = 'ember-electron/main.js';
  if (!existsSync(packageJson.main)) {
    throw new Error(`Your electron app's main module (${packageJson.main}) doesn't exist. Please re-run the ember-electron blueprint ('ember g ember-electron')`);
  }

  let {
    config: {
      forge: forgeConfig,
    } = {},
  } = packageJson;

  if (!forgeConfig) {
    throw new Error("Your package.json doesn't contain 'config.forge'. Please re-run the ember-electron blueprint ('ember g ember-electron').");
  }

  // In tests/index.html we need to rewrite the testem.js script tag. The URL
  // to testem.js is a relative URL, which means it will resolve to a serve://
  // URL. But we need to re-route the request to the testem http server, so we
  // need to rewrite it to be an http: URL so our test-main.js can use Electron
  // magic to redirect the request to the dynamically-generated testem server
  // URL.
  inputNode = replace(inputNode, {
    files: ['tests/index.html'],
    pattern: {
      match: /src="[^"]*testem\.js"/,
      replacement: 'src="http://testemserver/testem.js"',
    },
  });

  let trees = [
    writeFile('package.json', JSON.stringify(packageJson, null, '  ')),

    new Funnel(new UnwatchedDir('.'), {
      include: [
        'npm-shrinkwrap.json',
        'yarn.lock',
      ],
    }),

    new Funnel('ember-electron', {
      destDir: 'ember-electron',
      exclude: [
        'resources*/**',
        'resources*/**/.*',
        'test-main.js',
      ],
    }),

    new Funnel('ember-electron', {
      srcDir: 'resources',
      destDir: 'ember-electron/resources',
      allowEmpty: true,
    }),

    new Funnel('ember-electron', {
      srcDir: `resources-${platform}`,
      destDir: 'ember-electron/resources',
      allowEmpty: true,
    }),

    new Funnel(inputNode, {
      destDir: 'ember',
    }),
  ];

  if (process.env.EMBER_ENV === 'test') {
    // Overwrite main.js with test main.js
    trees.push(new Funnel(new UnwatchedDir('.'), {
      destDir: 'ember-electron',
      include: [
        'tests/ember-electron/main.js',
        'ember-electron/test-main.js',
      ],
      getDestinationPath() {
        return 'main.js';
      },
    }));
  }

  return mergeTrees(trees, {
    overwrite: true,
  });
};
