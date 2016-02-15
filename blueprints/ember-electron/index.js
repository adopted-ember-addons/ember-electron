var fs    = require('fs');
var path  = require('path');
var chalk = require('chalk');
var RSVP  = require('rsvp');

var denodeify = RSVP.denodeify;
var readFile  = denodeify(fs.readFile);
var writeFile = denodeify(fs.writeFile);

module.exports = {
    description: 'Install ember-electron in the project.',

    normalizeEntityName: function (entityName) {
        return entityName;
    },

    afterInstall: function (options) {
        var dependencies = this.project.dependencies();

        return this.addElectronConfig(options).then(function () {
            this.logConfigurationWarning();

            var packages = [];
            if (!dependencies['electron-prebuilt']) {
                packages.push({name: 'electron-prebuilt'});
            }

            if (!dependencies['electron-packager']) {
                packages.push({name: 'electron-packager'});
            }

            if (!dependencies['electron-packager']) {
                packages.push({name: 'ember-inspector'});
            }

            if (packages.length > 0) {
                return this.addPackagesToProject(packages);
            }
        }.bind(this));
    },

    addElectronConfig: function (options) {
        var ui = this.ui;
        var project = this.project;
        var packageJsonPath = path.join(project.root, 'package.json');

        if (project.pkg.main) {
            return RSVP.resolve();
        }

        var promise = readFile(packageJsonPath, {
            encoding: 'utf8'
        });

        return promise.then(function (data)  {
            var json = JSON.parse(data);

            json.main = 'electron.js';
            json['ember-electron'] = {
                'WHAT IS THIS?': 'Please see the README.md',
                'copy-files': ['electron.js', 'package.json'],
                name: null,
                platform: null,
                arch: null,
                version: null,
                'app-bundle-id': null,
                'app-category-type': null,
                'app-version': null,
                asar: null,
                'asar-unpack': null,
                'asar-unpack-dir': null,
                'build-version': null,
                cache: null,
                'helper-bundle-id': null,
                icon: null,
                ignore: null,
                out: null,
                overwrite: null,
                prune: null,
                sign: null,
                'strict-ssl': null,
                'version-string': {
                    CompanyName: null,
                    LegalCopyright: null,
                    FileDescription: null,
                    OriginalFilename: null,
                    ProductName: null,
                    InternalName: null
                }
            };

            ui.writeLine('  ' + chalk.yellow('overwrite') + ' package.json');

            if (!options.dryRun) {
                return writeFile(packageJsonPath, JSON.stringify(json, null, '  '));
            }
        }.bind(this));
    },

    logConfigurationWarning: function () {
        var info = 'Ember Electron requires configuration. Please consult the Readme to ensure that this addon works!';
        var url = 'https://github.com/felixrieseberg/ember-electron';

        this.ui.writeLine(chalk.yellow(info));
        this.ui.writeLine(chalk.green(url));
    }
};
