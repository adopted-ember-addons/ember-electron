# Ember-Electron
<a href="http://badge.fury.io/js/ember-electron"><img src="https://badge.fury.io/js/ember-electron.svg" alt="npm version" height="18"></a> <img src="https://david-dm.org/felixrieseberg/ember-electron.svg" alt="dependencies" height="18px"> <img src="https://img.shields.io/npm/dm/ember-electron.svg" height="18px" />
This addon enables the development of Desktop apps with Ember, Ember Cli, and GitHub's Electron. Huge thanks to @brzpegasus (author of `ember-cli-nwjs`) - a lot of code in this addon was taken from her project. It enables live development with Electron (similar to `ember serve`) as well as testing in Electron (similar to `ember test` and `ember test --server`).

![](https://raw.githubusercontent.com/felixrieseberg/ember-electron/master/_pic.png)

## Installation and Usage
> :warning: Please ensure that the blueprint generation runs - it creates necessary files and configuration for this addon to work. Please ensure that your `tests` folder contains a `package.json` and a `electron.js` - and that `locationType` in `config/environment.js` is set to `hash`. :warning:

To install the addon, run:
```
ember install ember-electron
```

Or, to install with npm:
```
npm install ember-electron
ember g ember-electron
```

Once you installed the addon, you'll notice that a new file called `electron.js` was created in the root folder of your application. This is the entry point for Electron and is responsible for creating browser windows and other interactions with Electron APIs.

### Conflict between Ember and Electron: require()
Both Ember Cli and Node.js use `require()`. Without ember-electron, Ember will start and overwrite Node's `require()` method, meaning that you're stuck without crucial tools such as `require('electron')`.

When using ember-electron, this conflict is automatically managed for you - you can continue to use Ember's `require()` for Ember Cli modules, but also use `requireNode()` for Node modules. The same is true for `window.module` (which is available as `window.moduleNode`) and `window.process` (which is available as `window.processNode`).

In addition, the `require()` method is overwritten to resolve both AMD and Node modules (see below) - however, to maintain code sanity, I heavily recommend using `require()` and `requireNode()`.

### Configuration and First Use
To run your app together with a file watcher in development mode (similar to `ember serve`), you can run  `ember electron`. However, you will need to change your configuration for Ember and Electron to work well together: Electron does not support the History API. Therefore Ember-Cli must be configured to use the `hash` location type. Update your `config/environment.js`'s `locationType` config option to `hash`. If you would like to support running the app both within and outside of Electron you can use the following switch:
```js
  locationType: process.env.EMBER_CLI_ELECTRON ? 'hash' : 'auto',
```

### Testing
To test your app, run `ember electron:test`. If you prefer the live-reload mode, run `ember electron:test --server`. The usual parameters are supported:

* `--server` - Run tests in interactive mode (default: false)
* `--protocol` - 'The protocol to use when running with --server (default: 'http')
* `--host` - The host to use when running with --server (default: 'localhost')
* `--port` - The port to use when running with --server (default: 7357)
* `--module` - The name of a test module to run
* `--filter` - A string to filter tests to run

## License
MIT - (C) Copyright 2015 Felix Rieseberg and Microsoft Corporation. Please see `LICENSE` for details.
