const path = require('path');

const electronProjectPath = 'electron';
const emberBuildDir = 'ember-dist';
const emberBuildPath = path.join(electronProjectPath, emberBuildDir);

module.exports = {
  electronProjectPath,
  emberBuildDir,
  emberBuildPath
};
