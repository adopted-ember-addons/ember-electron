'use strict';

var spawn = require('child_process').spawn;
var chalk = require('chalk');
var RSVP = require('rsvp');

var Promise = RSVP.Promise;

module.exports = {
    name: 'electron',
    description: 'Builds your app and launches Electron',

    init: function () {
        process.env.EMBER_CLI_ELECTRON = true;
    },

    availableOptions: [{
        name: 'environment',
        type: String,
        default: 'development',
        aliases: ['e', {
            'dev': 'development'
        }, {
            'prod': 'production'
        }]
    }, {
        name: 'output-path',
        type: String,
        default: 'dist/',
        aliases: ['o']
    }],

    buildWatch: function (options) {
        var ui = this.ui;
        var Watcher = require('ember-cli/lib/models/watcher');
        var Builder = require('ember-cli/lib/models/builder');

        ui.startProgress(chalk.green('Building'), chalk.green('.'));

        var watcher = new Watcher({
            ui: ui,
            builder: new Builder({
                ui: ui,
                project: this.project,
                environment: options.environment,
                outputPath: options.outputPath
            }),
            analytics: this.analytics,
            options: options
        });

        return watcher;
    },

    runElectron: function () {
        var ui = this.ui;
        var project = this.project;

        return new Promise(function (resolve, reject) {
            ui.writeLine(chalk.green('Starting Electron...'));

            var findElectron = require('../helpers/find-electron');
            var electronCommand = findElectron(project);

            var child = spawn(electronCommand, ['.'], {
                cwd: project.root,
                stdio: 'inherit'
            });

            child.on('error', function (error) {
                if (error.code === 'ENOENT') {
                    ui.writeLine('');
                    ui.writeLine(chalk.red("Error running the following command: " + electronCommand));
                    ui.writeLine('');
                    ui.writeLine(chalk.yellow("Either re-run the blueprint with 'ember g ember-electron' to add Electron as an NPM dependency in your project,"));
                    ui.writeLine(chalk.yellow("or set an environment variable named 'ELECTRON_PATH' pointing to your Electron binary."));
                    reject();
                } else {
                    ui.writeLine(chalk.red('Error running Electron.'));
                    reject(error);
                }
            });

            child.on('exit', function () {
                ui.writeLine(chalk.green('Electron exited.'));
                resolve();
            });
        });
    },

    run: function (options) {
        var _this = this;

        return this.buildWatch(options).then(function () {
            return _this.runElectron();
        });
    }
};