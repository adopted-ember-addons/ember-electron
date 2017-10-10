const path = require('path');
const { existsSync } = require('fs');
const { hasYarn } = require('yarn-or-npm');

//
// This function mimics ember-cli's logic for deciding when to use yarn vs. npm
//
function shouldUseYarn(projectRoot) {
  return existsSync(path.join(projectRoot, 'yarn.lock')) && hasYarn();
}

//
// This function sets an environment variable that forces electron-forge to use
// either yarn or npm, according to what shouldUseYarn() says.
//
function setupForgeEnv(projectRoot) {
  process.env.NODE_INSTALLER = shouldUseYarn(projectRoot) ? 'yarn' : 'npm';
}

module.exports = {
  shouldUseYarn,
  setupForgeEnv,
};
