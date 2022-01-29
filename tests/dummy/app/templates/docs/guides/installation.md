# Installation & Setup

> This addon requires at least Node 8 and `ember-cli` 3.4.0

## Installation

```sh
ember install ember-electron
ember g ember-electron
```

(manually running the blueprint is currently necessary because of [this issue](https://github.com/ember-cli/ember-cli/issues/7431) in `ember-cli`)

This will install `ember-electron` and create and initialize an [electron-forge](https://www.electronforge.io/) project in the `electron-app` directory inside your Ember app. Then you can run `ember electron` to launch your app in Electron.

## Upgrading

See [Guides: Upgrading](./upgrading) for information on how to upgrade from `ember-electron` 2.x.
