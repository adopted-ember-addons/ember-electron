'use strict';

const TestTask = require('ember-cli/lib/tasks/test');
const TestMixin = require('../utils/electron-test-mixin');

module.exports = TestTask.extend(TestMixin);
