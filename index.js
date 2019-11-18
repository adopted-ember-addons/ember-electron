const fs = require('fs');
const path = require('path');

function injectScript(scriptName) {
  let dirname = __dirname || process.cwd();
  let filePath = path.join(dirname, 'lib', 'resources', scriptName);
  let fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });

  return `<script>\n${fileContent}</script>`;
}

module.exports = {
  name: require('./package').name,

  included(app) {
    this._super.included.apply(this, arguments);

    if (!process.env.EMBER_CLI_ELECTRON) {
      return;
    }

    if (app.env === 'development') {
      app.import('vendor/electron/reload.js');
    }
  },

  includedCommands() {
    return {
      'electron': require('./lib/commands/electron'),
      'electron:test': require('./lib/commands/test'),
      'electron:build': require('./lib/commands/build'),
      'electron:package': require('./lib/commands/package'),
      'electron:make': require('./lib/commands/make'),
    };
  },

  contentFor(type) {
    const { env: { EMBER_CLI_ELECTRON } } = process;

    if (EMBER_CLI_ELECTRON) {
      let script = {
        'head': 'shim-head.js',
        'test-head': 'shim-test-head.js',
        'body-footer': 'shim-footer.js',
      }[type];

      if (script) {
        return injectScript(script);
      }
    }
  },
};
