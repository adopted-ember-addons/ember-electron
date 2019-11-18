const denodeify = require('denodeify');
const path = require('path');
const readFile = denodeify(require('fs').readFile);
const writeFile = denodeify(require('fs').writeFile);
const rimraf = denodeify(require('rimraf'));
const ncp = denodeify(require('ncp'));
const { emberBuildDir } = require('../lib/utils/build-paths');

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
      ''
    ].join('\n'));
  }
};
