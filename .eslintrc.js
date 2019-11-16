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
    node: true,
  },
  globals: {
    // Electron
    'requireNode': true,
    'processNode': true
  },
  rules: {
    'ember/no-const-outside-module-scope': 'off',
    'ember/no-direct-property-access': 'off',
    'ember/avoid-leaking-state-in-ember-objects': 'warn', // TODO: Remove after upgrading eslint >= 4.2.0
    'ember/no-jquery': 'error',
    'ember/require-access-in-comments': 'off',
    'newline-before-return': 'error',
    'no-console': 'off',
    'one-var': 'off',
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
    }
  ]
};
