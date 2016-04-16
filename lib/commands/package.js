'use strict';

const chalk     = require('chalk');
const RSVP      = require('rsvp');
const packager  = require('electron-packager');
const fs        = require('fs-extra');
const npmi      = require('npmi');
const glob      = require('globby');

const Promise = RSVP.Promise;

module.exports = {
    name: 'electron:package',
    description: 'Builds your app and launches Electron',

    init: function () {
        process.env.EMBER_CLI_ELECTRON = true;
    },

    availableOptions: [{
        name: 'environment',
        type: String,
        default: 'production',
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
        default: undefined,
        aliases: ['p']
    }, {
        name: 'arch',
        type: String,
        default: undefined,
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
        name: 'app-copyright',
        type: String,
        default: undefined
    }, {
        name: 'app-category-type',
        type: String,
        default: undefined,
        aliases: ['act']
    }, {
        name: 'app-version',
        type: String,
        default: undefined,
        aliases: ['av']
    }, {
        name: 'asar',
        type: Boolean,
        default: undefined,
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
        name: 'extend-info',
        type: String,
        default: undefined
    }, {
        name: 'extra-resource',
        type: String,
        default: undefined
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
        name: 'osx-sign',
        type: Object,
        default: undefined
    },{
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
        default: undefined,
        aliases: []
    }, {
        name: 'copy-files',
        type: String,
        default: undefined,
        aliases: []
    }, {
        name: 'copy-dev-modules',
        type: String,
        default: undefined,
        aliases: []
    }],

    build: function (options) {
        this.ui.startProgress(chalk.green('Building'), chalk.green('.'));
        this.modulesToCopy = [];

        const buildTask = new this.tasks.Build({
            ui: this.ui,
            modulesToCopy: this.modulesToCopy,
            analytics: this.analytics,
            project: this.project,
        });

        return buildTask.run({
            environment: options.environment,
            outputPath: './tmp/electron-build-tmp/dist'
        });
    },

    organize: function (options) {
        return new Promise((resolve, reject) => {
            try {
                const ee = this.project.pkg['ember-electron'] || {};
                const patterns = options['copy-files'] || ee['copy-files'] || ['electron.js', 'package.json'];
                const root = this.project.root + '/';
                let files = [];

                this.ui.writeLine('');
                this.ui.writeLine('Copying files into Electron Build folder');

                for (var i = 0; i < patterns.length; i++) {
                    files = files.concat(glob.sync(patterns[i]));
                }

                files.forEach((filename) => this.copy(filename, root, this.ui));
            } catch (err) {
                return reject(err);
            }

            resolve();
        });
    },

    copy: function (filename, root, ui) {
        try {
            ui.writeLine('Copying ' + filename);
            fs.copySync(root + filename, root + 'tmp/electron-build-tmp/' + filename);
        } catch (err) {
            ui.writeLine('');
            ui.writeLine(chalk.red('Error copying files into Electron package:'));
            ui.writeLine('');
            ui.writeLine(chalk.yellow(err.message));
        }
    },

    copyDevModules: function(options) {
          return new Promise((resolve, reject) => {
              if(options.copyDevModules || ee['copy-dev-modules']){
                const modules_lentgh = this.modulesToCopy.length;
                const target         = `${this.project.root}/tmp/electron-build-tmp/node_modules/`;
                const root           = `${this.project.root}/node_modules/`;

                if(modules_lentgh > 0) {
                    for (var i = 0; i < modules_lentgh; i++) {
                        try{
                             this.ui.writeLine('Copying ' + this.modulesToCopy[i] + ' from dev node_modules');
                             fs.copySync(root + this.modulesToCopy[i], target + this.modulesToCopy[i]);
                        } catch (err) {
                             reject(err);
                        }
                    }
                }
             }
             resolve();
         });

    },


    installDependency: function (installedDeps, name, version) {
        return new Promise((resolve, reject) => {
            const path = `${this.project.root}/tmp/electron-build-tmp`;
       
            npmi({name, version, path}, (err) => {
                if (err) {
                    this.ui.writeLine('');
                    this.ui.writeLine(chalk.red('Error installing a Node dependency into the Electron Bthis.uild Directory:'));
                    this.ui.writeLine('');
                    this.ui.writeLine(chalk.yellow(err.toString()));
                    return reject(err);
                }

                this.ui.writeLine('Installed and bundled ' + name + '@' + version);
                installedDeps.push(name);

                resolve(installedDeps);
            });
        });
    },

    installDependencies: function (options) {
        return new Promise((resolve) => {
            const deps = [];
            const ee = this.project.pkg['ember-electron'] || {};

            this.ui.writeLine(chalk.green('Installing production dependencies into Electron Build Package'));

            // Push all dependencies into an array for easier processing
            for (var name in this.project.pkg.dependencies) {
                // Check if we need to copy dev node_modules
                if(options.copyDevModules || ee['copy-dev-modules']){
                        // check if dependencie is added in dev dependencies
                        if (this.project.pkg.devDependencies.hasOwnProperty(name)) {
                                this.modulesToCopy.push(name);
                        } else {
                            // not in dev dependencies, adding to install
                             if (this.project.pkg.dependencies.hasOwnProperty(name)) {
                                 deps.push([name, this.project.pkg.dependencies[name]]);
                            }
                        }
                } else {
                          if (this.project.pkg.dependencies.hasOwnProperty(name)) {
                                 deps.push([name, this.project.pkg.dependencies[name]]);
                            }
                }
              
            }

            // Process the array in order
            var chain = deps.reduce((previous) => {
                return previous.then((installedDeps) => {
                    // Get the first dependency that isn't yet installed
                    var uninstalledDeps = deps.filter(function findUninstalled(element) {
                        if (installedDeps.indexOf(element[0]) < 0) {
                            return true;
                        }
                    });

                    if (uninstalledDeps.length > 0) {
                        return this.installDependency(installedDeps, uninstalledDeps[0][0], uninstalledDeps[0][1]);
                    } else {
                        return Promise.resolve(installedDeps);
                    }
                });
            }, Promise.resolve([]));

            // Everything installed
            chain.then((installedDeps) => resolve(installedDeps));
        });
    },

    recompileDependencies: function(options) {
        return new Promise((resolve, reject) => {
            // Testing native recompilation is tough, and a todo. Let's bail out here.
            if (process.env.EMBER_ELECTRON_TESTING) {
                return resolve();
            }

            const rebuild         = require('electron-rebuild');
            const prebuiltPackage = require(`${this.project.root}/node_modules/electron-prebuilt/package.json`);
            const electronVersion =  (prebuiltPackage) ? prebuiltPackage.version :                               undefined;
            const target          = `${this.project.root}/tmp/electron-build-tmp/node_modules`;
            const ee              = this.project.pkg['ember-electron'] || {};
            const arch            = options.arch || ee.arch;

            if (!electronVersion) {
                this.ui.writeLine('');
                this.ui.writeLine(chalk.red('Could not determine Electron Prebuilt version for native compilation.'));
                this.ui.writeLine('Please reinstall electron-prebuilt.');
                this.ui.writeLine('');
                return reject();
            }

            fs.ensureDirSync(target);
            this.ui.writeLine(`Installing Electron headers for version ${electronVersion}`);
            rebuild.installNodeHeaders(`v${electronVersion}`, undefined, undefined, arch)
                .then(() => {
                    this.ui.writeLine('Recompiling native dependencies');
                    rebuild.rebuildNativeModules(electronVersion, target)
                        .then(() => resolve());
                })
                .catch((e) => {
                    this.ui.writeLine('');
                    this.ui.writeLine(chalk.red('Native compilation did not work:'));
                    this.ui.writeLine(e);
                    this.ui.writeLine('');
                    return reject();
                });
        });
    },

    cleanup: function () {
        return new Promise((resolve, reject) => {
            fs.remove(`${this.project.root}/tmp/electron-build-tmp`, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    },

    ensureOut: function () {
        const buildsDir = `${this.project.root}/electron-builds`;
        fs.ensureDirSync(buildsDir);

        return (buildsDir);
    },

    package: function (options) {
        return new Promise((resolve, reject) => {
            this.ui.writeLine(chalk.green('Packaging Electron executables'), chalk.green('.'));

            const ee = this.project.pkg['ember-electron'] || {};
            const packageOptions = {
                dir: './tmp/electron-build-tmp',
                name: options.name || ee.name || this.project.pkg.name,
                platform: options.platform || ee.platform || 'all',
                arch: options.arch || ee.arch || 'all',
                version: options.version || ee.version || '0.37.5',
                'app-bundle-id': options.appBundleId || ee['app-bundle-id'],
                'app-category-type': options.appCategoryType || ee['app-category-type'],
                'app-copyright': options.appCopyright || ee['app-copyright'],
                'app-version': options.appVersion || ee['app-version'],
                asar: options.asar || ee.asar,
                'asar-unpack': options.asarUnpack || ee['asar-unpack'],
                'asar-unpack-dir': options.asarUnpackDir || ee['asar-unpack-dir'],
                'build-version': options.buildVersion || ee['build-version'],
                cache: options.cache || ee.cache,
                'extend-info': options.extendInfo || ee['extend-info'],
                'extra-resource': options.extraResource || ee['extra-resource'],
                'helper-bundle-id': options.helperBundleId || ee['helper-bundle-id'],
                icon: options.icon || ee.icon,
                ignore: options.ignore || ee.ignore,
                out: options.out || ee.out || this.ensureOut(),
                overwrite: options.overwrite || ee.overwrite,
                'osx-sign': options.osxSign || ee['osx-sign'],
                prune: options.prune || ee.prune,
                sign: options.sign || ee.sign,
                'strict-ssl': options.strictSsl || ee['strict-ssl'],
                'version-string': options.versionString || ee['version-string'],
                'copy-dev-modules': options.copyDevModules || ee['copy-dev-modules']
            };

            packager(packageOptions, (err) => {
                if (err) {
                    this.ui.writeLine('');
                    this.ui.writeLine(chalk.red('Error packaging your Ember app into an Electron executable:'));
                    this.ui.writeLine('');
                    this.ui.writeLine(chalk.yellow(err.toString()));
                    return reject(err);
                }

                resolve();
            });
        });
    },

    run: function (options) {
        return this.build(options)
            .then(() => this.organize(options))
            .then(() => this.installDependencies(options))
            .then(() => this.recompileDependencies(options))
            .then(() => this.copyDevModules(options))
            .then(() => this.package(options))
            .then(() => this.cleanup());
    }
};
