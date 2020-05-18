const { app, protocol } = require('electron');
const protocolServe = require('electron-protocol-serve');
const path = require('path');

module.exports = function setupServeProtocol(emberAppDir) {
  if (typeof protocol.registerSchemesAsPrivileged === 'function') {
    protocol.registerSchemesAsPrivileged([{
      scheme: 'serve',
      privileges: {
        secure: true,
        standard: true,
      },
    }]);
  }
  else {
    protocol.registerStandardSchemes(['serve'], { secure: true });
  }
  protocolServe({
    cwd: emberAppDir,
    app,
    protocol,
  });
    
  process.env.ELECTRON_PROTOCOL_SERVE_INDEX = path.join(emberAppDir, 'index.html');
}
