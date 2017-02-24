module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:ember-suave/recommended',
  ],
  env: {
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
};
