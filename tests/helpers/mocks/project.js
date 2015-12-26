'use strict';

var path = require('path');

function MockProject(name, pkg) {
    this.name = name;
    this.pkg = pkg || {};
    this.root = path.resolve(__dirname, '..', '..', 'fixtures', name);
    this.addons = [];
}

module.exports = MockProject;

MockProject.prototype.isEmberCLIProject = function() {
    return true;
};

MockProject.prototype.hasDependencies = function() {
    return true;
};

MockProject.prototype.initializeAddons = function() {};
