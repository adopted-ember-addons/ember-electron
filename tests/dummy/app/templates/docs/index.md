<p align="center"><img src="https://raw.githubusercontent.com/adopted-ember-addons/ember-electron/gh-pages/img/logo-github%402x.png" alt="Ember-Electron logo showing an electron orbiting a flame" width="300" height="250"></p>

# Ember-Electron

![Latest release on NPM](https://img.shields.io/npm/v/ember-electron.svg) 
[![Appveyor Build status](https://ci.appveyor.com/api/projects/status/5rhwhar361uad07v?svg=true)](https://ci.appveyor.com/project/rwwagner90/ember-electron)
![Travis CI Build Status](https://secure.travis-ci.org/adopted-ember-addons/ember-electron.svg?branch=master)

An Ember addon to turn Ember apps into cross-platform desktop applications, taking care of development, tests, compilation, and installer creation.

* `ember electron` - Run app in Electron with live-reload server
* `ember electron:test` - Test the app using Electron
* `ember electron:test --server` - Test with Electron in development server mode
* `ember electron:package` - Create binaries (.app, .exe, etc)
* `ember electron:make` - Generate platform specific distributables (installers, distribution packages, etc)
* `ember electron:build` - Build out Ember app with Electron instrumentation (useful for optimizing multi-platform builds)

To see a real world example, check out [Ghost Desktop](https://github.com/tryghost/Ghost-Desktop).

## Documentation

### Basics
- [Installation](guides/installation)
- [Usage](guides/usage)
- [Structure](guides/structure)

### Advanced Guides
- [Upgrading from ember-electron 2.x to 3.x](guides/upgrading)
- [Development and Debugging](guides/development-and-debugging)
- [Testing on CI (Travis, AppVeyor, CircleCI, etc)](guides/ci)

### FAQ
- [Common issues](faq/common-issues)
- [Security concerns](faq/security)

Somethings missing? Contributions to our docs are welcome!


## Support

Ember-Electron is a small open source project. Use [GitHub Issues](https://github.com/adopted-ember-addons/ember-electron/issues) to report bugs and errors within the addon.

If you need help *using* the addon with your application, may we recommend the excellent Ember community? You can check out the [various places to get help here](https://www.emberjs.com/community/). In particular, the [Ember community Discord](https://discordapp.com/invite/emberjs) has a `#topic-desktop` channel which is a great place to ask questions about `ember-electron`. If you have questions regarding Electron, their [Slack and forum](https://electron.atom.io/contact/) will be helpful as well.


## Authors

Ember-Electron builds on prior work done by @brzpegasus (author of [`ember-cli-nwjs`](https://github.com/brzpegasus/ember-cli-nwjs)) and @joostdevries (author of [`ember-cli-remote-inspector`](https://github.com/joostdevries/ember-cli-remote-inspector)). Our gratitude to both of them for their amazing work.

* Felix Rieseberg ([@felixrieseberg](https://github.com/felixriesberg))
* Aidan Nulman ([@anulman](https://github.com/anulman))
* Florian Pichler ([@pichfl](https://github.com/pichfl))
* Ben Demboski ([@bendemboski](https://github.com/bendemboski))
* [...and many other contributors](https://github.com/adopted-ember-addons/ember-electron/graphs/contributors)
