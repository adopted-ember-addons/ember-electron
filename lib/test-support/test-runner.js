//
// This script does double-duty. It can be included from testem-electron.js
// to define an Electron test runner like so:
//
// // testem.js
// module.exports = {
//   "launchers": {
//     "Electron": require("ember-electron/lib/test-support/test-runner")
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
  'args': [__filename, '<cwd>', '<baseUrl>', '<testPage>', '<id>'],
  'protocol': 'browser',
};

if (require.main === module) {
  let path = require('path');
  let url = require('url');
  let fileUrl = require('file-url');
  let treeKill = require('tree-kill');
  let { start: efStart } = require('@electron-forge/core').api;

  let [, , buildDir, testemUrl, testPageUrl, id] = process.argv;

  // The testPageUrl points to the testem server, so we need to turn it into a
  // file URL and add the testem ID to the query params.
  let emberAppDir = path.join(buildDir, 'ember');
  let {
    pathname: testPagePath,
    query: testPageQuery,
  } = url.parse(testPageUrl, true);
  let indexPath = path.resolve(emberAppDir, path.join.apply(null, testPagePath.split('/')));
  let indexObj = url.parse(fileUrl(indexPath));
  indexObj.query = testPageQuery;
  indexObj.query.testemId = id;
  let testUrl = url.format(indexObj);
  // On windows the testUrl argv is truncated before the first '&' by the time
  // it reaches our main.js. This appears to have something to do with how
  // electron-compile (I think) uses a batch script to invoke its cli.js, and
  // the fact that '&' is a special shell character. So we do our own cheesy
  // workaround.
  testUrl = testUrl.replace(/&/g, '__amp__');

  // Start electron
  efStart({
    appPath: buildDir,
    dir: buildDir,
    args: [
      '--', // needed because https://github.com/electron/electron/pull/13039
      testUrl,
      testemUrl,
    ],
  }).then(({ pid }) => {
    // Clean up when we're killed
    process.on('SIGTERM', () => {
      treeKill(pid);
    });
  });
}
