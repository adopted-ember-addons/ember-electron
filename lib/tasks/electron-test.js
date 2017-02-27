'use strict';

const TestTask = require('ember-cli/lib/tasks/test');
const TestMixin = require('./electron-test-mixin');

module.exports = TestTask.extend(TestMixin);
