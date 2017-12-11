/**
 * THIS FILE IS DEPRECATED. It has been moved to lib/test-support/ and
 * modified, but is left here so apps that haven't rerun the blueprint to
 * update the test-runner.js/test-main.js interactions will still function.
 **/

//
// This script does double-duty. It can be included from testem-electron.js
// to define an Electron test runner like so:
//
// // testem.js
// module.exports = {
//   "launchers": {
//     "Electron": require("ember-electron/test-runner")
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
  let fs = require('fs');
  let url = require('url');
  let fileUrl = require('file-url');
  let treeKill = require('tree-kill');
  let { start: efStart } = require('electron-forge');

  let [, , buildDir, baseUrl, testPageUrl, id] = process.argv;
  let emberAppDir = path.join(buildDir, 'ember');
  let baseObj = url.parse(baseUrl);
  let testPageObj = url.parse(testPageUrl, true);

  // Build testem.js URL
  baseObj.pathname = '/testem.js';
  let testemJsUrl = url.format(baseObj);

  // Process the HTML to:
  // * inject our getTestemId() script so the testem client can extract the ID
  //   from the query params and be able to communicate with the testem server
  // * rewrite the testem.js script to use an absolute URL pointing to the
  //   testem server
  let testPagePath = path.join(emberAppDir, path.join.apply(null, testPageObj.pathname.split('/')));
  let htmlContent = fs.readFileSync(testPagePath, 'utf8').toString();
  htmlContent = htmlContent.replace(/^(\s*)<head>/m, [
    '$1<head>',
    '$1  <script>',
    '$1    window.getTestemId = function() {',
    '$1      var match = window.location.search.match(/[\?&]testemId=([^\?&]+)/);',
    '$1      return match ? match[1] : null;',
    '$1    }',
    '$1  </script>',
  ].join('\n'));

  htmlContent = htmlContent.replace(/src="[^"]*testem\.js"/, `src="${  testemJsUrl  }"`);
  let htmlPath = path.join(emberAppDir, 'tests', 'index-electron.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  // Build a file: URL to our temp file, preserving query params from the test
  // page and adding the testem id
  let htmlFileObj = url.parse(fileUrl(htmlPath));
  htmlFileObj.query = testPageObj.query;
  htmlFileObj.query.testemId = id;
  let testUrl = url.format(htmlFileObj);
  // On windows the testUrl argv is truncated before the first '&' by the time
  // it reaches our main.js. This appears to have something to do with how
  // electron-compile (I think) uses a batch script to invoke its cli.js, and
  // the fact that '&' is a special shell character. So we do our own cheesy
  // workaround.
  testUrl = testUrl.replace(/&/g, '__amp__');

  // Start electron
  efStart({ appPath: buildDir, dir: buildDir, args: [testUrl] }).then(({ pid }) => {
    // Clean up when we're killed
    process.on('SIGTERM', () => {
      treeKill(pid);
    });
  });
}
