const { promisify } = require('util');
const path = require('path');
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);
const rimraf = promisify(require('rimraf'));
const ncp = promisify(require('ncp'));
const { emberBuildDir, emberTestBuildDir } = require('../lib/utils/build-paths');

module.exports = {
  devDependencies: [
    'devtron'
  ],
  dependencies: [
    'electron-protocol-serve'
  ],
  async initializeTemplate(dir) {
    // delete source directory with default files
    await rimraf(path.join(dir, 'src'));

    // copy our initial content
    await ncp(path.join(__dirname, 'files'), dir);

    // add our ember build directory to .gitignore
    let gitIgnorePath = path.join(dir, '.gitignore');
    let contents = await readFile(gitIgnorePath);
    await writeFile(gitIgnorePath, [
      contents.toString(),
      '# Ember build',
      `${emberBuildDir}/`,
      `${emberTestBuildDir}/`,
      ''
    ].join('\n'));
  }
};
