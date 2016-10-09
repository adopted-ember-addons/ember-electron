const standard = require('mocha-standard')
const files = ['tests/**/*.js', 'lib/**/*.js', 'app/**/*.js', 'blueprints/ember-electron/index.js']

describe('Standard JavaScript Style', () => {
  it('all non-user facing files conform', standard.files(files))
})
