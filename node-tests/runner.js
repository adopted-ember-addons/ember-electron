'use strict';

let glob = require('globby');
let Mocha = require('mocha');

let mocha = new Mocha({
  reporter: 'spec',
});

let root = 'node-tests/';

function addFiles(mocha, files) {
  glob.sync(root + files).forEach(mocha.addFile.bind(mocha));
}

addFiles(mocha, 'mocha-standard.js');
addFiles(mocha, '/unit/**/*-test.js');

mocha.run(function(failures) {
  process.on('exit', function() {
    process.exit(failures);
  });
});
