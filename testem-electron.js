module.exports = {
  'framework': 'qunit',
  'test_page': 'tests/index.html?hidepassed',
  'disable_watching': true,
  'launchers': {
    'Electron': require('./test-runner'),
  },
  'launch_in_ci': [
    'Electron',
  ],
  'launch_in_dev': [
    'Electron',
  ],
};
