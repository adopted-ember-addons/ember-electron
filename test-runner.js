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
  let efStart = require('electron-forge/dist/api/start').default;

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
  // We look for an optional leading '/' in the src attribute because ember cli
  // <2.9.0 hard-coded the leading '/' instead of using {{rootURL}}
  htmlContent = htmlContent.replace(/src="\/?testem\.js"/, `src="${  testemJsUrl  }"`);
  let htmlPath = path.join(emberAppDir, 'tests', 'index-electron.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  // Build a file: URL to our temp file, preserving query params from the test
  // page and adding the testem id
  let htmlFileObj = url.parse(fileUrl(htmlPath));
  htmlFileObj.query = testPageObj.query;
  htmlFileObj.query.testemId = id;
  let testUrl = url.format(htmlFileObj);

  // Start electron
  let pid;
  efStart({ appPath: buildDir, args: [testUrl] }).then(({ pid: childPid }) => {
    pid = childPid;
  });

  // Clean up when we're killed
  process.on('SIGTERM', function() {
    if (pid) {
      treeKill(pid);
    }
  });
}
