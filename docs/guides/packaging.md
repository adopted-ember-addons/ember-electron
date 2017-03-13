# Packaging
Ember-Electron comes with an integrated packager to create binaries (.app, .exe etc), which can be run with `ember electron:package`. By default, the packager creates binaries for all platforms and architectures using your app's name and version as defined in `package.json`. Under the hood, it uses [electron-forge](https://github.com/electron-userland/electron-forge)).

To create standalone binaries of your Ember App, simply run the following command:

```sh
ember electron:package
```

and they will be created in a `electron-out` directory at the root of your project.
