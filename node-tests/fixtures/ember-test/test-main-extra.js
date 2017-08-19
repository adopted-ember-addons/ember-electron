let cwd = __dirname || require('path').resolve(require('path').dirname());
// Make sure dependencies (node_modules) are copied correctly and we can
// load them
const fileUrl = require('file-url');
fileUrl('foo.html');
// Make sure local libraries are copied correctly and we can load them
const helper = require('./lib/helper.js');
helper();
// Make sure local resources are copied correctly and we can read them
const { readFileSync } = require('fs');
let content = readFileSync(`${cwd}/resources/foo.txt`).toString().trim();
if (content !== 'hello') {
  throw new Error(`${cwd}/resources/foo.txt should be contain 'hello': ${content}`);
}
