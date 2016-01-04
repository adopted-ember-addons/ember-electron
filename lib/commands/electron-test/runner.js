'use strict';

var spawn = require('child_process').spawn;
var argv = require('optimist').argv;

function runElectron(electronPath, testsPath) {
    var electron = spawn(electronPath, [testsPath]);
    var hasErrors = false;

    // Cleanup Electron output to be TAP (test anything protocol) compliant
    electron.stdout.on('data', function (data) {
        data = data.toString('utf8');

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

runElectron(argv['electron-path'], argv['tests-path']);
