const { join } = require('path');
const { app, protocol } = require('electron');
const fs = require('fs');

/**
 * Registers a ember:// file protocol which handles
 * the proper discovery of local files inside of Electron
 * without modifiying the Ember app.
 *
 * @param  {[type]} cwd the path to the dist folder of your Ember app
 * @return {[type]}     a factory registering a secure schema and a file protocol
 */
module.exports = (cwd) => {
  const indexPath = join(cwd, 'index.html');
  const cache = {};

  app.on('ready', () => {
    protocol.registerFileProtocol('ember', (request, callback) => {
      // Expect the request url to start with 'ember://ember'
      const [url/* , hash */] = request.url.substr(14).split('#');
      const urlSegments = url.split('/');

      if (urlSegments[0] === '') {
        urlSegments[0] = 'index.html';
      }

      const filepath = join(cwd, ...urlSegments);

      // redirect empty requests to index.html
      if (!cache[url]) {
        try {
          fs.accessSync(filepath);

          cache[url] = filepath;
        } catch(err) {
          //
        }
      }

      callback({ path: cache[url] || indexPath });
    }, (error) => {
      if (error) {
        console.error('Failed to register protocol');
      }
    });
  });
};
