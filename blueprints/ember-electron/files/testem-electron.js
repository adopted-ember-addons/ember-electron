/* eslint-env node */
module.exports = {
  'test_page': 'tests/index.html?hidepassed',
  'disable_watching': true,
  'launchers': {
    'Electron': require('ember-electron/lib/test-support/test-runner'),
  },
  'launch_in_ci': [
    'Electron',
  ],
  'launch_in_dev': [
    'Electron',
  ],
};
