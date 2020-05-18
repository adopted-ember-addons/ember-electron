//
// This script does double-duty. It can be included from testem-electron.js
// to define an Electron test runner like so:
//
// // testem.js
// module.exports = {
//   "launchers": {
//     "Electron": require("ember-electron/lib/test-runner")
//   },
//   "launch_in_ci": [
//     "Electron"
//   ],
//   "launch_in_dev": [
//     "Electron"
//   ]
// }
//
// The runner is configured to invoke this script as a command-line executable
// with the proper arguments to run electron and communicate back to testem.
//

module.exports = {
  'exe': 'node',
  // These arguments are used in `lib/test-support/index.js`, which is called
  // from the test main process (via the blueprint-generated
  // `electron-app/tests/index.js`)
  'args': [__filename, '<testPage>', '<baseUrl>', '<id>'],
  'protocol': 'browser',
};

async function main() {
  const path = require('path');
  const treeKill = require('tree-kill');
  const { api } = require('ember-electron/lib/utils/forge-core');
  const { electronProjectPath } = require('ember-electron/lib/utils/build-paths');

  let [, , testPageUrl, testemUrl, testemId] = process.argv;

  // Start electron
  let { pid } = await api.start({
    dir: path.join(process.cwd(), electronProjectPath),
    appPath: './tests',
    args: [
      '--', // needed because https://github.com/electron/electron/pull/13039
      testPageUrl,
      testemUrl,
      testemId
    ],
  });
  // Clean up when we're killed
  process.on('SIGTERM', () => {
    treeKill(pid);
  });
}

if (require.main === module) {
  main();
}
