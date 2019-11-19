// Make sure dependencies (node_modules) are loadable
const fileUrl = require('file-url');
fileUrl('foo.html');
// Make sure local libraries are loadable
const helper = require('../src/helper');
helper();
