const path = require('path');

const electronProjectPath = 'electron-app';

const emberBuildDir = 'ember-dist';
const emberBuildPath = path.join(electronProjectPath, emberBuildDir);

const emberTestBuildDir = 'ember-test';
const emberTestBuildPath = path.join(electronProjectPath, emberTestBuildDir);

const packageOutDir = 'out';
const packageOutPath = path.join(electronProjectPath, packageOutDir);

module.exports = {
  electronProjectPath,
  emberBuildDir,
  emberBuildPath,
  emberTestBuildDir,
  emberTestBuildPath,
  packageOutDir,
  packageOutPath,
};
