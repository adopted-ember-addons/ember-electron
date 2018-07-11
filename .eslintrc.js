module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  plugins: [
    'ember',
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
  ],
  env: {
    es6: true,
    qunit: true,
    node: true,
  },
  globals: {
    // 'expectAssertion': true,
    // 'expectDeprecation': true,
    // 'expectNoDeprecation': true,
    // 'expectWarning': true,
    // 'expectNoWarning': true,
    // 'ignoreAssertion': true,
    // 'ignoreDeprecation': true,

    // Electron
    'requireNode': true,
    'processNode': true,

    // A safe subset of "browser:true":
    // 'window': true,
    // 'document': true,
    // 'setTimeout': true,
    // 'clearTimeout': true,
    // 'setInterval': true,
    // 'clearInterval': true,

    // 'Symbol': true,
    // 'WeakMap': true,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'ember-suave/no-const-outside-module-scope': 'off',
    'ember-suave/no-direct-property-access': 'off',
    'ember-suave/require-access-in-comments': 'off',
    'newline-before-return': 'error',
    'no-console': 'off',
    'one-var': 'off',
  },
  overrides: [
    // node files
    {
      files: [
        'index.js',
        'testem.js',
        'ember-cli-build.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'app/**',
        'addon/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
      })
    },

    // test files
    {
      files: ['tests/**/*.js'],
      excludedFiles: ['tests/dummy/**/*.js'],
      env: {
        embertest: true
      }
    }
  ]
};
