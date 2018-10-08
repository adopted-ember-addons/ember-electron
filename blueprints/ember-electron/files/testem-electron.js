/* eslint-env node */
module.exports = {
  browser_start_timeout: 120,   // Shouldn't need 2 minutes to connect but it seems that less isn't always enough for some CI systems
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launchers: {
    Electron: require('ember-electron/lib/test-support/test-runner'),
  },
  launch_in_ci: [
    'Electron',
  ],
  launch_in_dev: [
    'Electron',
  ],
  browser_args: {
    Electron: {
      // Note: Some these Chrome options may not be supported in Electron
      // See https://electronjs.org/docs/api/chrome-command-line-switches
      ci: [
        // --no-sandbox may be needed when running inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900'
      ].filter(Boolean)
    }
  }
};
