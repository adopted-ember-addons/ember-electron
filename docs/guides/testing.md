# Testing

To test your app, run `ember electron:test`. If you prefer the live-reload mode, run `ember electron:test --server`. The usual parameters are supported:

- `--server` - Run tests in interactive mode (default: false)
- `--protocol` - 'The protocol to use when running with --server (default: 'http')
- `--host` - The host to use when running with --server (default: 'localhost')
- `--port` - The port to use when running with --server (default: 7357)
- `--module` - The name of a test module to run
- `--filter` - A string to filter tests to run

When running `ember electron:test`, testem is configured to use `/testem-electron.js` instead of `/testem.js` (to allow projects to run as traditional ember apps as well as electron apps). The blueprint will install this file, but if you want to modify it to change any testem configuration, make sure to modify the right file.
