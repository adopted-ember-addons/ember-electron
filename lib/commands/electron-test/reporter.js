'use strict';

const util        = require('util');
const TapReporter = require('testem/lib/reporters/tap_reporter');

function CustomTapReporter() {
    this.out = process.stdout;
    this.silent = false;
    this.stoppedOnError = null;
    this.id = 1;
    this.total = 0;
    this.pass = 0;
    this.skipped = 0;
    this.failed = 0;
    this.results = [];
    this.errors = [];
    this.logs = [];
}

util.inherits(CustomTapReporter, TapReporter);

CustomTapReporter.prototype.report = function (prefix, data) {
    if (data.items && data.items.length > 0) {
        try {
            var details = JSON.parse(data.items[0].stack);
            data.error = {
                actual: details.actual,
                expected: details.expected,
                message: details.message
            };
        } catch (error) {
            process.stderr.write(data.items[0].stack);
        }
    }

    CustomTapReporter.super_.prototype.report.call(this, prefix, data);
};

module.exports = new CustomTapReporter();
