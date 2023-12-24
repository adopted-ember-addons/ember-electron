const { expect } = require('chai');
const { getAssetPath } = require('../../forge/files/src/handle-file-urls');
const tmp = require('tmp');
const {
  promises: { mkdir, writeFile },
} = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

describe('handle-file-urls', function () {
  let emberAppDir;

  let indexHtmlPath;
  let vendorJsPath;
  let rootImagePath;
  let imagePath;

  let externalFilePath;

  beforeEach(async function () {
    emberAppDir = tmp.dirSync().name;
    let assetsDir = path.join(emberAppDir, 'assets');
    await mkdir(assetsDir);

    // index.html is loaded from the root using an absolute file: URL
    indexHtmlPath = path.join(emberAppDir, 'index.html');
    await writeFile(indexHtmlPath, 'index');

    // Scripts are loaded (in the <script> tag) using a relative URL so the dev
    // tools can load source maps, so they end up also being absolute file: URLs
    // when they get to us (and this tests that we can load absolute paths that
    // point to subdirectories of the Ember app dir)
    vendorJsPath = path.join(assetsDir, 'vendor.js');
    await writeFile(vendorJsPath, 'vendor');

    // The whole point of this hoop-jumping is to support loading things like
    // images using absolute URL paths (in their <img> tags) as per Ember
    // standard, so they end up arriving as absolute file: URLs, but their path
    // need to be interpreted as relative to the Ember app dir. We create two
    // images so we can test relative URLs pointing to files both in the Ember
    // app directory root, and a subdirectory of the Ember app directory
    imagePath = path.join(emberAppDir, 'root-image.png');
    await writeFile(imagePath, 'root-image');

    rootImagePath = path.join(assetsDir, 'image.png');
    await writeFile(rootImagePath, 'image');

    // We don't want to interfere with the ability to load files outside the
    // Ember app dir, so we allow the file: URLs to point there as well
    let otherDir = tmp.dirSync().name;
    externalFilePath = path.join(otherDir, 'external.txt');
    await writeFile(externalFilePath, 'external');
  });

  it('handles absolute paths in the Ember app dir', async function () {
    await expect(
      getAssetPath(emberAppDir, pathToFileURL(indexHtmlPath)),
    ).to.eventually.equal(indexHtmlPath);
    await expect(
      getAssetPath(emberAppDir, pathToFileURL(vendorJsPath)),
    ).to.eventually.equal(vendorJsPath);
  });

  it('handles relative paths in the Ember app dir', async function () {
    let rootImageRelPath = `/${path.relative(emberAppDir, rootImagePath)}`;
    let imageRelPath = `/${path.relative(emberAppDir, imagePath)}`;

    await expect(
      getAssetPath(emberAppDir, pathToFileURL(rootImageRelPath)),
    ).to.eventually.equal(rootImagePath);
    await expect(
      getAssetPath(emberAppDir, pathToFileURL(imageRelPath)),
    ).to.eventually.equal(imagePath);
  });

  it('handles files outside the Ember app dir', async function () {
    await expect(
      getAssetPath(emberAppDir, pathToFileURL(externalFilePath)),
    ).to.eventually.equal(externalFilePath);
  });
});
