'use strict';

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
      ],
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
        './.stylelintrc.js',
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
      extends: ['plugin:n/recommended'],
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
      extends: ['plugin:n/recommended'],
      rules: {
        'n/no-missing-require': [
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
      extends: ['plugin:n/recommended'],
      rules: {
        'n/no-missing-require': [
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
