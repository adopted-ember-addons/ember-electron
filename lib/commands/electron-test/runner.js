'use strict';

var exec = require('child_process').exec;
var argv = require('optimist').argv;
var fs = require('fs');

runElectron(argv['electron-path'], argv['tests-path']);

function runElectron(electronPath, testsPath) {
    var electron = exec(electronPath + ' ' + testsPath);
    var hasErrors = false;

    // Cleanup Electron output to be TAP (test anything protocol) compliant
    electron.stdout.on('data', function (data) {
        if (data.indexOf('[qunit-logger]') > -1) {
            data = data.replace('[qunit-logger] ', '');
            data = data + '\n';

            process.stdout.write(data);
            
            if (data === '# done with errors') {
                hasErrors = true;
            }

            if (data.indexOf('# done') > -1) {
                electron.kill();
                process.exit(hasErrors ? 1 : 0);
            }
        }
    });
}