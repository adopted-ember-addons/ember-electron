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
      'electron:make': require('./lib/commands/make'),
    };
  },

  included(app) {
    this._super.included.apply(this, arguments);

    app.import('vendor/wrap-require.js', {
      type: 'vendor',
    });
  },

  contentFor(type) {
    const {
      env: { EMBER_CLI_ELECTRON },
    } = process;

    if (EMBER_CLI_ELECTRON) {
      switch (type) {
        case 'head':
          return injectScript('shim-head.js');
        case 'test-head':
          // shim-test-head.js does some testem setup, and we need to set the
          // base to `..` so the base URL of assets loaded from
          // `tests/index.html` will be the same as the base URL of assets
          // loaded from `index.html`, and the assets will load correctly (see
          // https://ember-electron.js.org/versions/v3.0.0-beta.5/docs/faq/routing-and-asset-loading)
          return [injectScript('shim-test-head.js'), '<base href="..">'].join(
            '\n'
          );
        case 'test-body':
          // testem.js needs to load over HTTP because of how testem works. We
          // have main process code to intercept `http://testemserver` requests
          // and redirect them to the actual testem server URL. We don't have a
          // good embroider-safe way of rewriting the script tag that already
          // exists in `tests/index.html`, so we just leave it there harmlessly
          // no-op'ing, and add another script tag that will load testem.js via
          // `http://testemserver`.
          return '<script src="http://testemserver/testem.js"></script>';
        case 'body-footer':
          return injectScript('shim-footer.js');
      }
    }
  },
};
