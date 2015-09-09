# Ember-Electron
This addon enables the development of Desktop apps with Ember, Ember Cli, and GitHub's Electron. Huge thanks to @brzpegasus (author of `ember-cli-nwjs`) - a lot of code in this addon was taken from her project.

## Installation

To install the addon, run:

```
ember install ember-electron
```

Or, to install with npm:

```
npm install ember-electron
ember g ember-electron
```

## Usage & Testing
To run your app together with a file watcher in development mode (similar to `ember serve`), run  `ember electron`.

To test your app, run `ember electron:test`. If you prefer the live-reload mode, run `ember electron:test --server`. The usual parameters are supported:

* `--server` - Run tests in interactive mode (default: false)
* `--protocol` - 'The protocol to use when running with --server (default: 'http')
* `--host` - The host to use when running with --server (default: 'localhost')
* `--port` - The port to use when running with --server (default: 7357)
* `--module` - The name of a test module to run
* `--filter` - A string to filter tests to run