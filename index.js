const replace = require('broccoli-string-replace');

function injectScript(scriptName) {
  return `<script src="/ember-electron/${scriptName}"></script>`;
}

module.exports = {
  name: require('./package').name,

  includedCommands() {
    return {
      electron: require('./lib/commands/electron'),
      'electron:test': require('./lib/commands/test'),
      'electron:build': require('./lib/commands/build'),
      'electron:package': require('./lib/commands/package'),
      'electron:make': require('./lib/commands/make')
    };
  },

  included(app) {
    this._super.included.apply(this, arguments);

    app.import('vendor/wrap-require.js', {
      type: 'vendor'
    });
  },

  contentFor(type) {
    const {
      env: { EMBER_CLI_ELECTRON }
    } = process;

    if (EMBER_CLI_ELECTRON) {
      let script = {
        head: 'shim-head.js',
        'test-head': 'shim-test-head.js',
        'body-footer': 'shim-footer.js'
      }[type];

      if (script) {
        return injectScript(script);
      }
    }
  },

  postprocessTree(type, node) {
    if (type === 'all' && process.env.EMBER_CLI_ELECTRON) {
      node = replace(node, {
        files: ['tests/index.html'],
        pattern: {
          match: /(src|href)="([^"]+)"/g,
          replacement(match, attr, value) {
            if (value.endsWith('testem.js')) {
              // Replace testem script source so our test main process code can
              // recognize and redirect requests to the testem server
              value = 'http://testemserver/testem.js';
            } else if (!value.includes(':/')) {
              // Since we're loading from the filesystem, asset URLs in
              // tests/index.html need to be prepended with '../'
              value = `../${value}`;
            }
            return `${attr}="${value}"`;
          }
        }
      });
    }
    return node;
  }
};
