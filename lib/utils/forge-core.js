const { electronProjectPath } = require('./build-paths');

try {
  module.exports = require(
    require.resolve('@electron-forge/core', {
      paths: [electronProjectPath],
    }),
  );
} catch (e) {
  throw new Error(
    [
      `Unable to import '@electron-forge' from '${electronProjectPath}'`,
      `-- make sure it's present in '${electronProjectPath}/package.json'`,
      `and you've run 'yarn' or 'npm install' from '${electronProjectPath}'.`,
      `Error:\n\n${e.stack}`,
    ].join(' '),
  );
}
