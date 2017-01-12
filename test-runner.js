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
var path = require('path');

module.exports = {
  "exe": "node",
  "args": [ __filename, "<cwd>", "<baseUrl>", "<testPage>", "<id>" ],
  "protocol": "browser"
};

if (require.main === module) {
  var os = require('os');
  var fs = require('fs');
  var url = require('url');
  var fileUrl = require('file-url');
  var execFile = require('child_process').execFile;
  var getElectronApp = require('./lib/helpers/find-electron').getElectronApp;

  var buildDir = process.argv[2];
  var baseObj = url.parse(process.argv[3]);
  var testPageObj = url.parse(process.argv[4], true);
  var id = process.argv[5];

  // Build testem.js URL
  baseObj.pathname = '/testem.js';
  var testemJsUrl = url.format(baseObj);

  // Process the HTML to:
  // * add a <base> pointing to the current working directory so we can find
  //   our scripts
  // * inject our getTestemId() script so the testem client can extract the ID
  //   from the query params and be able to communicate with the testem server
  // * rewrite the testem.js script to use an absolute URL pointing to the
  //   testem server
  var testPagePath = path.join(buildDir, path.join.apply(null, testPageObj.pathname.split('/')));
  var htmlContent = fs.readFileSync(testPagePath, 'utf8').toString();
  htmlContent = htmlContent.replace(/^(\s*)<head>/m, [
    '$1<head>',
    '$1  <base href="' + fileUrl(buildDir) + '/">',
    '$1  <script>',
    '$1    window.getTestemId = function() {',
    '$1      var match = window.location.search.match(/[\?&]testemId=([^\?&]+)/);',
    '$1      return match ? match[1] : null;',
    '$1    }',
    '$1  </script>'
  ].join('\n'));
  // We look for an optional leading '/' in the src attribute because ember cli
  // <2.9.0 hard-coded the leading '/' instead of using {{rootURL}}
  htmlContent = htmlContent.replace(/src="\/?testem\.js"/, 'src="' + testemJsUrl + '"');
  var htmlPath = path.join(buildDir, "tests", "index-electron.html");
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  // Build a file: URL to our temp file, preserving query params from the test
  // page and adding the testem id
  var htmlFileObj = url.parse(fileUrl(htmlPath));
  htmlFileObj.query = testPageObj.query;
  htmlFileObj.query.testemId = id;
  var testUrl = url.format(htmlFileObj);

  var child = execFile(getElectronApp(), [path.join(buildDir, "tests", "electron.js"), testUrl], function(error) {
    if (error) {
      throw error;
    }
  });

  process.on('SIGTERM', function() {
    child.kill();
  });
}
