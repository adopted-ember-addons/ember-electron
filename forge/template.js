const { BaseTemplate } = require('@electron-forge/template-base');
const { promisify } = require('util');
const path = require('path');
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);
const rimraf = promisify(require('rimraf'));
const ncp = promisify(require('ncp'));
const {
  emberBuildDir,
  emberTestBuildDir,
  packageOutDir,
} = require('../lib/utils/build-paths');

async function updateGitIgnore(dir) {
  // add our ember build directories to .gitignore
  let gitIgnorePath = path.join(dir, '.gitignore');
  let contents = await readFile(gitIgnorePath);
  await writeFile(
    gitIgnorePath,
    [
      contents.toString(),
      '# Ember build',
      `${emberBuildDir}/`,
      `${emberTestBuildDir}/`,
      // `electron-packager` will automatically ignore the output directory, but
      // if someone were to build once without specifying a custom output path,
      // and then build with a custom output path, during the second build,
      // `electron-packager` would only ignore the custom output path, and not the
      // contents of `packageDir`, so it would package up all that previously
      // built content in the second packaged application.
      '# package/make output directory',
      `${packageOutDir}/`,
      '',
    ].join('\n')
  );
}

async function updatePackageJson(dir) {
  // add our test and test build directories and the test directory to
  // electron-packager's ignores
  let packageJsonPath = path.join(dir, 'package.json');
  let packageJson = JSON.parse(await readFile(packageJsonPath));
  packageJson.config.forge.packagerConfig.ignore = [
    emberTestBuildDir,
    'tests',
  ].map((dir) => `/${dir}(/|$)`); // these are regexes, not globs

  // copy some fields from the Ember project's package.json
  let parentPackageJson = JSON.parse(
    await readFile(path.join(dir, '../package.json'))
  );
  const keysToCopy = ['name', 'version', 'description', 'author', 'license'];
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
    return ['devtron'];
  }
  get dependencies() {
    return ['electron-devtools-installer', 'electron-is-dev'];
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
