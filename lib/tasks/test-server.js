'use strict';

const TestServerTask = require('ember-cli/lib/tasks/test-server');
const TestTaskMixin = require('../utils/test-task-mixin');

module.exports = TestServerTask.extend(TestTaskMixin);
