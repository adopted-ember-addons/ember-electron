'use strict';

module.exports = {
  singleQuote: true,
  trailingComma: 'none',
  overrides: [
    {
      files: '**/*.hbs',
      options: {
        parser: 'glimmer',
        singleQuote: false
      }
    }
  ]
};