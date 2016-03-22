'use strict';

const Builder      = require('ember-cli/lib/models/builder');
const Watcher      = require('ember-cli/lib/models/watcher');

module.exports = {
    name: 'electron:test',
    description: 'Runs your test suite in Electron',

    availableOptions: [{
        name: 'environment',
        type: String,
        default: 'test',
        aliases: ['e']
    }, {
        name: 'server',
        type: Boolean,
        description: 'Run tests in interactive mode',
        default: false
    }, {
        name: 'protocol',
        type: 'String',
        description: 'The protocol to use when running with --server',
        default: 'http'
    }, {
        name: 'host',
        type: String,
        description: 'The host to use when running with --server',
        default: 'localhost',
        aliases: ['H']
    }, {
        name: 'port',
        type: Number,
        description: 'The port to use when running with --server',
        default: 7357,
        aliases: ['p']
    }, {
        name: 'module',
        type: String,
        description: 'The name of a test module to run',
        aliases: ['m']
    }, {
        name: 'filter',
        type: String,
        description: 'A string to filter tests to run',
        aliases: ['f']
    }, {
        name: 'test-page',
        type: String,
        description: 'The test page to run'
    }],

    init: function () {
        this.assign = require('lodash/object').assign;
        this.quickTemp = require('quick-temp');

        this.Builder = this.Builder || Builder;
        this.Watcher = this.Watcher || Watcher;

        if (!this.testing) {
            process.env.EMBER_CLI_TEST_COMMAND = true;
        }

        process.env.EMBER_CLI_ELECTRON = true;
    },

    tmp: function () {
        return this.quickTemp.makeOrRemake(this, '-testsDistElectron');
    },

    rmTmp: function () {
        this.quickTemp.remove(this, '-testsDistElectron');
    },

    taskOptions: function () {
        return {
            ui: this.ui,
            analytics: this.analytics,
            project: this.project
        };
    },

    runTestsForCI: function (options) {
        const buildTask = new this.tasks.Build(this.taskOptions());
        const ElectronTest = this.tasks.Test.extend(require('./task'));
        const testTask = new ElectronTest(this.taskOptions());

        const testOptions = this.assign({}, options, {
            outputPath: options.outputPath,
            reporter: require('./reporter')
        });

        return buildTask.run({
            environment: options.environment,
            outputPath: options.outputPath
        }).then(() => testTask.run(testOptions));
    },

    runTestsForDev: function (options) {
        process.env.ELECTRON_TESTS_DEV = true;
        process.env.ELECTRON_TESTEM_SERVER_URL = options.protocol + '://' + options.host + ':' + options.port;

        // Test filtering
        const queryString = this.getTestPageQueryString(options);
        if (queryString.length > 0) {
            process.env.ELECTRON_TEST_PAGE_OPTIONS = queryString;
        }

        // Start the test server task
        const testOptions = this.assign({}, options, {
            outputPath: options.outputPath,
            project: this.project
        });

        const taskOptions = this.taskOptions();
        taskOptions.builder = new this.Builder(testOptions);

        const ElectronTestServer = this.tasks.TestServer.extend(require('./task'));
        const testServer = new ElectronTestServer(taskOptions);

        testOptions.watcher = new this.Watcher(this.assign(taskOptions, {
            verbose: false,
            options: options
        }));

        return testServer.run(testOptions);
    },

    getTestPageQueryString: function (options) {
        const params = [];

        if (options.module) {
            params.push('module=' + options.module);
        }

        if (options.filter) {
            params.push('filter=' + options.filter.toLowerCase());
        }

        return params.join('&');
    },

    run: function (options) {
        options.outputPath = this.tmp();

        let promise;

        if (options.server) {
            promise = this.runTestsForDev(options);
        } else {
            promise = this.runTestsForCI(options);
        }

        return promise.finally(this.rmTmp.bind(this));
    }
};
