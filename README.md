<p align="center"><img src="https://github.com/adopted-ember-addons/ember-electron/raw/gh-pages/assets/logo-github%402x.png" alt="Ember-Electron logo showing an electron orbiting a flame" width="300" height="250"></p>

# Ember-Electron

![Latest release on NPM](https://img.shields.io/npm/v/ember-electron.svg) [![Build status](https://ci.appveyor.com/api/projects/status/5rhwhar361uad07v?svg=true)](https://ci.appveyor.com/project/adopted-ember-addons/ember-electron)
 ![Travis CI Build Status](https://secure.travis-ci.org/adopted-ember-addons/ember-electron.svg?branch=master) ![Code Climate](https://codeclimate.com/github/adopted-ember-addons/ember-electron.svg)

An Ember addon to turn Ember apps into cross-platform desktop applications, taking care of development, tests, compilation, and installer creation.

* `ember electron` - Run app in Electron with live-reload server
* `ember electron:test` - Test the app using Electron
* `ember electron:test --server` - Test with Electron in development server mode
* `ember electron:package` - Create binaries (.app, .exe, etc)
* `ember electron:make` - Generate platform specific distributables (installers, distribution packages, etc)
* `ember electron:build` - Build out Ember app with Electron instrumentation (useful for optimizing multi-platform builds)
* `ember electron:assemble` - Assemble Electron application project (useful for debugging builds)

To see a real world example, check out [Ghost Desktop](https://github.com/tryghost/Ghost-Desktop).

## Documentation

### Basics
- [Installation](https://adopted-ember-addons.github.io/ember-electron/docs/guides/installation)
- [Usage](https://adopted-ember-addons.github.io/ember-electron/docs/guides/usage)
- [Configuration](https://adopted-ember-addons.github.io/ember-electron/docs/guides/configuration)
- [Testing](https://adopted-ember-addons.github.io/ember-electron/docs/guides/testing)
- [Packaging](https://adopted-ember-addons.github.io/ember-electron/docs/guides/packaging)

### Advanced Guides
- [Upgrading from ember-electron 1.x to 2.x](https://adopted-ember-addons.github.io/ember-electron/docs/guides/upgrade)
- [Testing on CI (Travis, AppVeyor, CircleCI, etc)](https://adopted-ember-addons.github.io/ember-electron/docs/guides/ci)
- [Build pipeline](https://adopted-ember-addons.github.io/ember-electron/docs/guides/build-pipeline.md)

### FAQ

- [Common issues](https://adopted-ember-addons.github.io/ember-electron/docs/faq/common-issues)
- [File structure](https://adopted-ember-addons.github.io/ember-electron/docs/faq/structure)
- [Security concerns](https://adopted-ember-addons.github.io/ember-electron/docs/faq/security)

Somethings missing? Contributions to our docs are welcome!


## Support

Ember-Electron is a small open source project. Use [GitHub Issues](https://github.com/adopted-ember-addons/ember-electron/issues) to report bugs and errors within the addon.

If you need help *using* the addon with your application, may we recommend the excellent Ember community? You can the [various places to get help here](https://www.emberjs.com/community/). If you have questions regarding Electron, their [Slack and forum](https://electron.atom.io/contact/) will be helpful as well.


## Development

`ember-electron` uses [Semantic Release](https://github.com/semantic-release/semantic-release) to
automate the whole release process. In order to have a PR merged, please ensure that your PR
follows the commit guidelines so that our robots can understand your change. This repository uses
the [`conventional-changelog` rules from the `eslint` repository](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-eslint).


## Authors

Ember-Electron builds on prior work done by @brzpegasus (author of [`ember-cli-nwjs`](https://github.com/brzpegasus/ember-cli-nwjs)) and @joostdevries (author of [`ember-cli-remote-inspector`](https://github.com/joostdevries/ember-cli-remote-inspector)). Our gratitude to both of them for their amazing work.

* Felix Rieseberg ([@felixrieseberg](https://github.com/felixriesberg))
* Aidan Nulman ([@anulman](https://github.com/anulman))
* Florian Pichler ([@pichfl](https://github.com/pichfl))
* Ben Demboski ([@bendemboski](https://github.com/bendemboski))
* [...and many other contributors](https://github.com/adopted-ember-addons/ember-electron/graphs/contributors)
