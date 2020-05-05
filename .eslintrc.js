'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true
    }
  },
  plugins: [
    'ember'
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    es6: true,
    qunit: true,
    node: true
  },
  globals: {
    // Electron
    'requireNode': true,
    'processNode': true
  },
  rules: {
    'ember/no-jquery': 'error'
  },
  overrides: [
    // node files
    {
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/commands/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
        'ember/avoid-leaking-state-in-ember-objects': 'off',
      })
    },
    // forge template files
    {
      files: [
        'forge/files/**/*.js'
      ],
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        'node/no-missing-require': ['error', {
          'allowModules': [
            'electron',
            'electron-devtools-installer',
            'electron-is-dev',
            'ember-electron'
          ],
        }]
      })
    },
    // mocha files
    {
      files: [
        'node-tests/**/*.js'
      ],
      env: {
        browser: false,
        node: true,
        mocha: true
      }
    }
  ]
};
