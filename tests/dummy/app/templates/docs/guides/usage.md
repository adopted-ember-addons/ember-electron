# Usage

## Running Your App

To run your app in development mode, run

```sh
ember electron
```

This is the equivalent of `ember serve` -- it defaults to building for the development environment, and live reloads when you make changes to your Ember app (but not your `electron-forge` project files -- see [Common Issues](../faq/common-issues#why-doesnt-my-application-reload-when-i-change-electron-forge-project-files-)). It supports many of the same parameters as `ember serve` does -- run `ember help electron` to see them all.

## Running Tests

To test your app, run

```sh
ember electron:test
```

or

```sh
ember electron:test --server
```

to run in live-reload mode. It supports many of the same parameters as `ember test` does -- run `ember help electron:test` to see them all.

## Packaging Your App for Distribution

### Configuration

The process of packaging an application for distribution involves quite a bit of configuration. `ember-electron`'s installation blueprint will set you up with some defaults to get you started, but you will likely want to customize the configuration at some point. In `electron-app/package.json` you'll see

```
"config": {
  "forge": {
    "packagerConfig": {},
    "makers": [
      ...
    ]
  }
}
```

This configuration is read directly by `electron-forge`, so you should use its [documentation](https://www.electronforge.io/configuration) as reference.

### Making

To make installers for your application that you can distribute, run

```sh
ember electron:make
```

This is a thin wrapper around [electron-forge make](https://www.electronforge.io/cli#make). It will build out the installers specified by the `makers` array in your forge config and place them in `electron-app/out`. Various command-line arguments can customize the platform you are building for, the make targets to build, and allow you to reuse already-built content to speed things up, e.g., in CI -- run `ember help electron:make` to see them all.

The make command also supports a `--publish` argument that will use `electron-forge`'s [publish command](https://www.electronforge.io/cli#publish) to publish your installers to configured publish targets.

### Packaging

To package your application into a platform specific executable format, run

```sh
ember electron:package
```

This is a thin wrapper around [electron-forge package](https://www.electronforge.io/cli#package). It will produce the same result you would get by running `ember electron:make` and then installing one of the installers, so is a good way to run your application under the same conditions that end-users will run it, rather than in a development environment. It will place the result in `electron-app/out`. Various command-line arguments can customize the platform you are building for, and allow you to reuse an already-built Ember app to speed things up, e.g., in CI -- run `ember help electron:package` to see them all.
