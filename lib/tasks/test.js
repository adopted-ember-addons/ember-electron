'use strict';

const TestTask = require('ember-cli/lib/tasks/test');
const TestTaskMixin = require('../utils/test-task-mixin');

module.exports = TestTask.extend(TestTaskMixin);
