'use strict';

const util        = require('util');
const TapReporter = require('testem/lib/ci/test_reporters/tap_reporter');

function CustomTapReporter() {
    this.out = process.stdout;
    this.silent = false;
    this.stoppedOnError = null;
    this.id = 1;
    this.total = 0;
    this.pass = 0;
    this.results = [];
    this.errors = [];
    this.logs = [];
}

util.inherits(CustomTapReporter, TapReporter);

CustomTapReporter.prototype.report = function (prefix, data) {
    const stack = data.items && data.items.length > 0 && data.items[0].stack;

    if (stack) {
        try {
            var details = JSON.parse(stack);
            data.error = {
                actual: details.actual,
                expected: details.expected,
                message: details.message
            };
        } catch (error) {
            process.stderr.write(stack);
        }
    }

    CustomTapReporter.super_.prototype.report.call(this, prefix, data);
};

module.exports = new CustomTapReporter();
