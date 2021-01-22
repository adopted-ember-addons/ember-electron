const tmp = require('tmp');
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const path = require('path');
const { electronProjectPath } = require('../../lib/utils/build-paths');

module.exports = function () {
  let cwd;
  before(function () {
    cwd = process.cwd();
    process.chdir(tmp.dirSync().name);
  });

  after(function () {
    process.chdir(cwd);
  });

  beforeEach(function () {
    // do this in beforeEach() so individual tests can delete it if they are
    // testing error behavior or something
    if (!existsSync(electronProjectPath)) {
      mkdirSync(electronProjectPath);
    }
    let packageJsonPath = path.join(electronProjectPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      writeFileSync(packageJsonPath, '{}');
    }
  });
};
