'use strict';

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
  plugins: ['ember'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:prettier/recommended',
  ],
  env: {
    browser: true,
    es6: true,
    qunit: true,
    node: true,
  },
  globals: {
    // Electron
    requireNode: true,
    processNode: true,
  },
  rules: {
    'ember/no-jquery': 'error',
  },
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './index.js',
        './testem.js',
        './blueprints/*/index.js',
        './config/**/*.js',
        './lib/commands/*.js',
        './tests/dummy/config/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        'ember/avoid-leaking-state-in-ember-objects': 'off',
      },
    },
    // test runner
    {
      files: ['lib/test-runner.js'],
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        'node/no-missing-require': [
          'error',
          {
            allowModules: ['ember-electron'],
          },
        ],
      },
    },
    // Electon runtime files
    {
      files: ['forge/files/**/*.js', 'lib/test-support/**/*.js'],
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      extends: ['plugin:node/recommended'],
      rules: {
        'node/no-missing-require': [
          'error',
          {
            allowModules: [
              'devtron',
              'electron',
              'electron-devtools-installer',
              'electron-is-dev',
              'ember-electron',
            ],
          },
        ],
      },
    },
    // mocha files
    {
      files: ['node-tests/**/*.js'],
      env: {
        browser: false,
        node: true,
        mocha: true,
      },
    },
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      extends: ['plugin:qunit/recommended'],
    },
  ],
};
