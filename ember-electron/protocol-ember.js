const { basename, join } = require('path');
const { app, protocol } = require('electron');
const fs = require('fs');

/**
 * Registers a ember:// file protocol which handles
 * the proper discovery of local files inside of Electron
 * without modifiying the Ember app.
 *
 * @param  {[type]} cwd the path to the dist folder of your Ember app
 * @param  {[type]} indexPath the path to your Ember app's index.html if not <cwd>/index.html
 * @return {[type]}     a factory registering a secure schema and a file protocol
 */
module.exports = (cwd, indexPath) => {
  indexPath = indexPath || join(cwd, 'index.html');
  const directoryIndexFile = basename(indexPath);
  const cache = {};

  app.on('ready', () => {
    protocol.registerFileProtocol('ember', (request, callback) => {
      // Expect the request url to start with 'ember://ember'
      const [url/* , hash */] = request.url.substr(14).split('#');
      const urlSegments = url.split('/');

      if (urlSegments[0] === '') {
        urlSegments[0] = directoryIndexFile;
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
