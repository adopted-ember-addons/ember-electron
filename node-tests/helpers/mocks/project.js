'use strict';

const EmberMockProject = require('ember-cli/tests/helpers/mock-project');
const path = require('path');

class MockProject extends EmberMockProject {
  constructor({ name = 'project-simple', pkg = {}, ui } = {}) {
    super();

    this.name = name;
    this.pkg = pkg;
    this.ui = ui;
    this.root = path.resolve(__dirname, '..', '..', 'fixtures', name);
    this.addons = [];
  }

  isEmberCLIProject() {
    return true;
  }

  hasDependencies() {
    return true;
  }

  initializeAddons() {
    return true;
  }
}

module.exports = MockProject;
