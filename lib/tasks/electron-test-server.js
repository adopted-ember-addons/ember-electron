'use strict';

const TestServerTask = require('ember-cli/lib/tasks/test-server');
const TestMixin = require('../utils/electron-test-mixin');

module.exports = TestServerTask.extend(TestMixin);
