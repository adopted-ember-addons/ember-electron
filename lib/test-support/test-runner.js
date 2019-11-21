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

async function main() {
  const path = require('path');
  const url = require('url');
  const fileUrl = require('file-url');
  const treeKill = require('tree-kill');
  const { api } = require('@electron-forge/core');
  const { electronProjectPath } = require('ember-electron/lib/utils/build-paths');

  let [, , emberAppDir, testemUrl, testPageUrl, id] = process.argv;

  // The testPageUrl points to the testem server, so we need to turn it into a
  // file URL and add the testem ID to the query params.
  let {
    pathname: testPagePath,
    query: testPageQuery,
  } = url.parse(testPageUrl, true);
  let indexPath = path.resolve(emberAppDir, path.join.apply(null, testPagePath.split('/')));
  let indexObj = url.parse(fileUrl(indexPath));
  indexObj.query = testPageQuery;

  // https://github.com/nodejs/node/issues/9500
  for (let [ key, value ] of Object.entries(indexObj.query)) {
    if ([ null, undefined, '' ].includes(value)) {
      indexObj.query[key] = 'true';
    }
  }

  // Set this so the script in shim-test-head.js can expose it to testem
  indexObj.query.testemId = id;

  let testUrl = url.format(indexObj);

  // Start electron
  let { pid } = await api.start({
    dir: path.join(process.cwd(), electronProjectPath),
    appPath: './tests',
    args: [
      '--', // needed because https://github.com/electron/electron/pull/13039
      testUrl,
      testemUrl,
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
