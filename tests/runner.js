'use strict';

var glob  = require('glob');
var Mocha = require('mocha');
var mochaJSHint = require('mocha-jshint');


var mocha = new Mocha({
    reporter: 'spec'
});

var root = 'tests/';

function addFiles(mocha, files) {
    glob.sync(root + files).forEach(mocha.addFile.bind(mocha));
}

addFiles(mocha, 'mocha-jshint-test.js');
addFiles(mocha, 'mocha-jscs-test.js');
//addFiles(mocha, '/unit/**/*-test.js');

mocha.run(function(failures) {
    process.on('exit', function() {
        process.exit(failures);
    });
});
