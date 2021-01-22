'use strict';

const BaseCommand = require('./base');
const { getPortPromise } = require('portfinder');

module.exports = BaseCommand.extend({
  name: 'electron',
  description:
    'Builds your app and launches Electron. You can pass extra flags (e.g. --inspect-brk) to Electron by putting them after `---`',

  availableOptions: [
    { name: 'watcher', type: String, default: 'events', aliases: ['w'] },
    {
      name: 'environment',
      type: String,
      default: 'development',
      aliases: ['e', { dev: 'development' }, { prod: 'production' }],
      description:
        'Possible values are "development", "production", and "test".'
    },
    { name: 'live-reload', type: Boolean, default: true, aliases: ['lr'] },
    {
      name: 'live-reload-host',
      type: String,
      default: 'localhost',
      aliases: ['lrh']
    },
    {
      name: 'live-reload-port',
      type: Number,
      aliases: ['lrp'],
      description: 'Defaults to random available port'
    },
    {
      name: 'live-reload-prefix',
      type: String,
      default: '_lr',
      aliases: ['lrprefix'],
      description: 'Default to _lr'
    }
  ],

  async run(commandOptions) {
    await this.prepareRun();

    await this.setupLiveReload(commandOptions);

    // Parse out the extra arguments to be passed as command-line args directly
    // to the electron app
    let separatorIndex = process.argv.indexOf('---');
    if (separatorIndex !== -1) {
      commandOptions.electronArgs = process.argv.slice(separatorIndex + 1);
    }

    return await this.runTask('Electron', commandOptions);
  },

  async setupLiveReload(commandOptions) {
    //
    // The live reload server is tied closely enough to the app server that it's
    // much easier to run them both rather than try to run the live reload
    // server on its own. So we set them up to run on the same port, ignoring
    // the app's default port, since the user never has to know/see the port as
    // it's only used for live reload.
    //
    // Unfortunately we can't set the ports to 0 and let the underlying server
    // find an open port because of how the live reloading works.
    // ember-cli-inject-live-reload uses a contentFor() hook during the build to
    // insert a script tag into index.html that loads a bootstrap script from
    // the app server that, when run, determines the actual live reload script
    // URL and loads it via a script tag (and it starts listening on the
    // websocket for reload messages).
    //
    // ember-cli-inject-live-reload uses a relative URL for the bootstrap script
    // which only works if index.html was loaded from the app server. Since we
    // load it from the filesystem, we have to use an absolute URL, which means
    // we need to know the port of the app server. Because of how the various
    // builder/watcher/server pieces work, we have to start the build before the
    // app server is up and running, so if we let the app server determine its
    // own port and then read it back, it would be too late to inject into the
    // build. So we have to generate the port ourselves, and then use it to tell
    // ember-cli-inject-live-reload where to load the bootstrap script from.
    //
    // The bootstrap script also assumes it's loaded over HTTP, and uses
    // window.location and various other pieces of info to generate the URL to
    // the live reload script. So we also need to tell ember-cli-inject-live-reload
    // the URL for the live reload script.
    //
    let {
      liveReload,
      liveReloadHost: host,
      liveReloadPort: port,
      liveReloadPrefix: prefix
    } = commandOptions;

    if (liveReload) {
      // generate a port if we weren't given one
      port = port || (await getPortPromise());

      Object.assign(commandOptions, {
        // Set the app server port to the same as the live reload port. This
        // simplifies things, and the user will never see the app port, so it's
        // arbitrary anyway
        port,
        liveReloadPort: port,
        // This tells ember-cli-inject-live-reload to base URL pointing to the
        // app server so it can generate a URL to the bootstrap script
        liveReloadBaseUrl: `http://${host}:${port}/`,
        // This causes ember-cli-inject-live-reload to generate the bootstrap
        // script such that it points to the live reload script with the various
        // params needed for it to work properly
        liveReloadJsUrl: `http://${host}:${port}/${prefix}/livereload.js?port=${port}&host=${host}&path=${prefix}/livereload`
      });
    } else {
      // If live reload is disabled, set the app server port to 0 so it will use
      // a random available port, and we don't risk the command failing because
      // whatever default port is configured is already in use
      commandOptions.port = 0;
    }
  }
});
