'use strict';

var path = require('path');
var findElectron = require('../../helpers/find-electron');

function safePath(filePath) {
    // Guard against file paths that contain spaces
    return '"' + filePath + '"';
}

module.exports = {
    testemOptions: function (options) {
        /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        return {
            host: options.host,
            port: options.port,
            cwd: options.outputPath,
            reporter: options.reporter,
            middleware: this.addonMiddlewares(),
            launch_in_dev: ['Electron'],
            launch_in_ci: ['Electron (CI)'],
            launchers: {
                'Electron': {
                    command: this.electronCommand(options),
                    protocol: 'browser'
                },
                'Electron (CI)': {
                    command: this.electronCommandForCI(options),
                    protocol: 'tap'
                }
            }
        };
        /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
    },

    electronCommand: function (options) {
        var electronPath = safePath(findElectron(this.project));
        var testPath = safePath(path.join(options.outputPath, 'tests'));
        
        return electronPath + ' ' + testPath;
    },

    electronCommandForCI: function (options) {
        var command = 'node';
        var commandArgs = safePath(path.join(__dirname, './runner.js'));
        var commandFlags = [
            '--electron-path=' + safePath(findElectron(this.project)),
            '--tests-path=' + safePath(path.join(options.outputPath, 'tests'))
        ];

        return [command, commandArgs].concat(commandFlags).join(' ');
    }
};