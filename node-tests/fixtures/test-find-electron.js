if (process.argv[2]) {
  require('os').platform = function() {
    return process.argv[2];
  };
}

let findElectron = require('./find-electron').getElectronApp;
process.stdout.write(findElectron());
