const { BaseTemplate } = require('@electron-forge/template-base');
const { promisify } = require('util');
const path = require('path');
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);
const rimraf = promisify(require('rimraf'));
const ncp = promisify(require('ncp'));
const {
  emberBuildDir,
  emberTestBuildDir
} = require('../lib/utils/build-paths');

async function updateGitIgnore(dir) {
  // add our ember build directories to .gitignore
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

async function updatePackageJson(dir) {
  // add our test and test build directories and the test directory to
  // electron-packager's ignores
  let packageJsonPath = path.join(dir, 'package.json');
  let packageJson = JSON.parse(await readFile(packageJsonPath));
  packageJson.config.forge.packagerConfig.ignore = [
    emberTestBuildDir,
    'tests'
  ].map((dir) => `/${dir}(/|$)`); // these are regexes, not globs

  // copy some fields from the Ember project's package.json
  let parentPackageJson = JSON.parse(await readFile(path.join(dir, '../package.json')));
  const keysToCopy = [
    'name',
    'version',
    'description',
    'author',
    'license'
  ];
  for (let key of keysToCopy) {
    if (Object.keys(parentPackageJson).includes(key)) {
      packageJson[key] = parentPackageJson[key];
    }
  }

  // special-case productName since forge creates it, but a lot of apps don't
  packageJson.productName = parentPackageJson.productName || packageJson.name;
  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

class EmberElectronTemplates extends BaseTemplate {
  constructor() {
    super(...arguments);
    this.templateDir = path.join(__dirname, 'files');
  }

  get devDependencies() {
    return [
      'devtron',
      'electron-devtools-installer'
    ];
  }
  get dependencies() {
    return [
      'electron-protocol-serve'
    ];
  }

  async initializeTemplate(dir) {
    await super.initializeTemplate(...arguments);

    // delete source directory with default files
    await rimraf(path.join(dir, 'src'));

    // copy our initial content
    await ncp(this.templateDir, dir);

    await updateGitIgnore(dir);
    await updatePackageJson(dir);
  }

}

module.exports = new EmberElectronTemplates();
