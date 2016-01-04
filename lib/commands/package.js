'use strict';

var chalk     = require('chalk');
var RSVP      = require('rsvp');
var packager  = require('electron-packager');
var fs        = require('fs-extra');
var npmi      = require('npmi');

var Promise = RSVP.Promise;

module.exports = {
    name: 'electron:package',
    description: 'Builds your app and launches Electron',

    init: function () {
        process.env.EMBER_CLI_ELECTRON = true;
    },

    availableOptions: [{
        name: 'environment',
        type: String,
        default: 'development',
        aliases: ['e', {
            dev: 'development'
        }, {
            prod: 'production'
        }]
    }, {
        name: 'name',
        type: String,
        default: '',
        aliases: ['n']
    }, {
        name: 'platform',
        type: String,
        default: 'all',
        aliases: ['p']
    }, {
        name: 'arch',
        type: String,
        default: 'all',
        aliases: ['a']
    }, {
        name: 'version',
        type: String,
        default: undefined,
        aliases: ['v']
    }, {
        name: 'app-bundle-id',
        type: String,
        default: undefined,
        aliases: ['abi']
    }, {
        name: 'app-category-id',
        type: String,
        default: undefined,
        aliases: ['aci']
    }, {
        name: 'app-version',
        type: String,
        default: undefined,
        aliases: ['av']
    }, {
        name: 'asar',
        type: Boolean,
        default: false,
        aliases: ['as']
    }, {
        name: 'asar-unpack',
        type: String,
        default: undefined,
        aliases: ['asu']
    }, {
        name: 'asar-unpack-dir',
        type: String,
        default: undefined,
        aliases: ['asud']
    }, {
        name: 'build-version',
        type: String,
        default: undefined,
        aliases: ['bv']
    }, {
        name: 'helper-bundle-id',
        type: String,
        default: undefined,
        aliases: ['hbi']
    }, {
        name: 'icon',
        type: String,
        default: undefined,
        aliases: ['i']
    }, {
        name: 'ignore',
        type: String,
        default: undefined,
        aliases: []
    }, {
        name: 'out',
        type: String,
        default: undefined,
        aliases: ['o']
    }, {
        name: 'overwrite',
        type: Boolean,
        default: false,
        aliases: []
    }, {
        name: 'prune',
        type: Boolean,
        default: false,
        aliases: []
    }, {
        name: 'sign',
        type: String,
        default: undefined,
        aliases: []
    }, {
        name: 'strict-ssl',
        type: Boolean,
        default: true,
        aliases: []
    }],

    build: function () {
        this.ui.startProgress(chalk.green('Building'), chalk.green('.'));

        var buildTask = new this.tasks.Build({
            ui: this.ui,
            analytics: this.analytics,
            project: this.project
        });

        return buildTask.run({
            environment: 'production',
            outputPath: './tmp/electron-build-tmp/dist'
        });
    },

    organize: function () {
        var project = this.project;

        return new Promise(function (resolve, reject) {
            try {
                fs.copySync(project.root + '/electron.js', project.root + '/tmp/electron-build-tmp/electron.js');
                fs.copySync(project.root + '/package.json', project.root + '/tmp/electron-build-tmp/package.json');
            } catch (err) {
                return reject(err);
            }

            resolve();
        });
    },

    installDependency: function (installedDeps, name, version) {
        var ui = this.ui;
        var project = this.project;

        return new Promise(function (resolve, reject) {
            var installDir = project.root + '/tmp/electron-build-tmp';

            npmi({name: name, version: version, path: installDir}, function (err) {
                if (err) {
                    ui.writeLine('');
                    ui.writeLine(chalk.red('Error installing a Node dependency into the Electron Build Directory:'));
                    ui.writeLine('');
                    ui.writeLine(chalk.yellow(err.toString()));
                    return reject(err);
                }

                ui.writeLine('Installed and bundled ' + name + '@' + version);
                installedDeps.push(name);

                resolve(installedDeps);
            });
        });
    },

    installDependencies: function () {
        var project = this.project;
        var ui = this.ui;
        var self = this;

        return new Promise(function (resolve) {
            var deps = [];

            ui.writeLine(chalk.green('Installing production dependencies into Electron Build Package'));

            // Push all dependencies into an array for easier processing
            for (var name in project.pkg.dependencies) {
                if (project.pkg.dependencies.hasOwnProperty(name)) {
                    deps.push([name, project.pkg.dependencies[name]]);
                }
            }

            // Process the array in order
            var chain = deps.reduce(function (previous) {
                return previous.then(function (installedDeps) {
                    // Get the first dependency that isn't yet installed
                    var uninstalledDeps = deps.filter(function findUninstalled(element) {
                        if (installedDeps.indexOf(element[0]) < 0) {
                            return true;
                        }
                    });

                    if (uninstalledDeps.length > 0) {
                        return self.installDependency(installedDeps, uninstalledDeps[0][0], uninstalledDeps[0][1]);
                    } else {
                        return Promise.resolve(installedDeps);
                    }
                });
            }, Promise.resolve([]));

            // Everything installed
            chain.then(function (installedDeps) {
                return resolve(installedDeps);
            });
        });
    },

    cleanup: function () {
        var project = this.project;

        return new Promise(function (resolve, reject) {
            fs.remove(project.root + '/tmp/electron-build-tmp', function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    ensureOut: function () {
        var buildsDir = this.project.root + '/electron-builds';
        fs.ensureDirSync(buildsDir);

        return (buildsDir);
    },

    package: function (options) {
        var ui = this.ui;
        var project = this.project;
        var self = this;

        return new Promise(function (resolve, reject) {
            ui.writeLine(chalk.green('Packaging Electron executables'), chalk.green('.'));

            var packageOptions = {
                dir: './tmp/electron-build-tmp',
                name: options.name || project.pkg.name,
                platform: options.platform,
                arch: options.arch,
                version: options.version || '0.36.2',
                'app-bundle-id': options['app-bundle-id'],
                'app-category-type': options['app-category-type'],
                'app-version': options['app-version'],
                asar: options.asar,
                'asar-unpack': options['asar-unpack'],
                'asar-unpack-dir': options['asar-unpack-dir'],
                'build-version': options['build-version'],
                // TODO: Smart default for the following
                // cache: options.cache,
                'helper-bundle-id': options['helper-bundle-id'],
                icon: options.icon,
                ignore: options.ignore,
                out: options.out || self.ensureOut(),
                overwrite: options.overwrite,
                prune: options.prune,
                sign: options.sign,
                'strict-ssl': options.strictSsl
                // 'version-string': {},
            };

            packager(packageOptions, function done(err) {
                if (err) {
                    ui.writeLine('');
                    ui.writeLine(chalk.red('Error packaging your Ember app into an Electron executable:'));
                    ui.writeLine('');
                    ui.writeLine(chalk.yellow(err.toString()));
                    return reject(err);
                }

                resolve();
            });
        });
    },

    run: function (options) {
        var self = this;

        return this.build(options).then(function () {
            return self.organize().then(function () {
                return self.installDependencies().then(function () {
                    return self.package(options).then(function () {
                        return self.cleanup();
                    });
                });
            });
        });
    }
};
