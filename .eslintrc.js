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
    'ember/no-const-outside-module-scope': 'off',
    'ember/no-direct-property-access': 'off',
    'ember/require-access-in-comments': 'off',
    'newline-before-return': 'error',
    'no-console': 'off',
    'one-var': 'off',
  },
  overrides: [
    {
      // node files
      files: [
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'lib/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2015
      },
      env: {
        browser: false,
        node: true,
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        'ember/avoid-leaking-state-in-ember-objects': 'off',
        'node/no-extraneous-require': ['error', {
          'allowModules': ['electron']
        }],
       'no-process-exit': 'warn', // TODO: Examine `lib/models/assembler.js` to see if throwing would be better
       'node/no-missing-require': ['error', {
          'allowModules': ['electron']
       }]
      })
    }, {
      // However, the "shim" resource files will go into code run by a browser
      files: ['lib/resources/shim-*.js'],
      env: {
        browser: true,
      }
    }, {
      // mocha tests
      files: [
        'node-tests/**/*.js'
      ],
      env: {
        node: true,
        mocha: true,
      }
    }, {
      // ember-cli is guaranteed to be present when running blueprints
      // and when running addon tasks
      files: [
        'blueprints/**/*.js',
        'lib/**/*.js',
      ],
      rules: {
        "node/no-unpublished-require": ["error", {
          "allowModules": ["ember-cli"]
        }],
      }
    },
  ]
};
