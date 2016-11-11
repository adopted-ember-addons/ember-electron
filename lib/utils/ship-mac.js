const fs = require('fs-extra');
const path = require('path');
const childProcess = require('child_process');

const PromiseExt = require('ember-cli/lib/ext/promise');

module.exports = function shipMac(pkg, options) {
  const ee = pkg['ember-electron'];
  const mkdir = PromiseExt.denodeify(fs.mkdirs);

  return mkdir(path.join('electron-builds', 'installers'))
    .catch((err) => {
      // n.b. mkdir throws if dir already exists; that's fine for us
    })
    .then(() => PromiseExt.all([
      createZip(pkg, options)
    ]));
}

function createZip(pkg, options) {
  const ee = pkg['ember-electron'];

  const name = options.name || ee.name || pkg.name;
  const platform = options.platform || ee.platform;
  const arch = options.arch || ee.arch;

  const opts = {
    cwd: 'electron-builds',
    stdio: 'ignore'
  };
  const input = `${name}-${platform}-${arch}`;
  const output = path.join('installers', `${name}.zip`);

  const zip = childProcess.spawn('zip', ['-r', output, input], opts);

  return new PromiseExt((resolve, reject) => {
    zip.on('close', (code) => {
      switch (code) {
      case 0: resolve();
      default: reject(`Error shipping for Mac: zip command threw ${code}`);
      }
    });
  });
}
