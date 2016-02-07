# Ember-Electron
<a href="https://travis-ci.org/felixrieseberg/ember-electron"><img src="https://travis-ci.org/felixrieseberg/ember-electron.svg"></a> <a href="http://badge.fury.io/js/ember-electron"><img src="https://badge.fury.io/js/ember-electron.svg" alt="npm version" height="18"></a> <img src="https://david-dm.org/felixrieseberg/ember-electron.svg" alt="dependencies" height="18px"> <img src="https://img.shields.io/npm/dm/ember-electron.svg" height="18px" />

<img src="https://raw.githubusercontent.com/felixrieseberg/ember-electron/master/logo.gif" alt="Logo" align="right" /> This addon enables the development of Desktop apps with Ember, Ember Cli, and GitHub's Electron. It enables live development with Electron (similar to `ember serve`) as well as testing in Electron (similar to `ember test` and `ember test --server`). It also comes with an integrated packager, turning your Ember App into standalone binaries for Windows, Mac OS X, and Linux. The commands are:

* `ember electron` - Run app in Electron with live-reload server
* `ember electron:test` - Test the app using Electron
* `ember electron:test --server` - Test with Electron in development server mode
* `ember electron:package` - Create binaries (.app, .exe, etc) for your app

## Installation and Usage
To install the addon, run:
```
ember install ember-electron
```

Or, to install with npm - but please ensure (:warning:) that the blueprint generation runs - it creates necessary files and configuration for this addon to work. Please ensure that your `tests` folder contains a `package.json` and a `electron.js` - and that `locationType` in `config/environment.js` is set to `hash`.
```
npm install ember-electron
ember g ember-electron
```

Once you installed the addon, you'll notice that a new file called `electron.js` was created in the root folder of your application. This is the entry point for Electron and is responsible for creating browser windows and other interactions with Electron APIs.

### Configuration and First Use
To run your app together with a file watcher in development mode (similar to `ember serve`), you can run  `ember electron`. However, you will need to change your configuration for Ember and Electron to work well together: Electron does not support the History API. Therefore Ember-Cli must be configured to use the `hash` location type. Update your `config/environment.js`'s `locationType` config option to `hash`. If you would like to support running the app both within and outside of Electron you can use the following switch:

```js
  locationType: process.env.EMBER_CLI_ELECTRON ? 'hash' : 'auto',
```

## Testing
To test your app, run `ember electron:test`. If you prefer the live-reload mode, run `ember electron:test --server`. The usual parameters are supported:

* `--server` - Run tests in interactive mode (default: false)
* `--protocol` - 'The protocol to use when running with --server (default: 'http')
* `--host` - The host to use when running with --server (default: 'localhost')
* `--port` - The port to use when running with --server (default: 7357)
* `--module` - The name of a test module to run
* `--filter` - A string to filter tests to run

## Packaging
Ember-Electron comes with an integrated packager to create binaries (.app, .exe etc), which can be run with `ember electron:package`. By default, the packager creates binaries for all platforms and architectures using your app's name and version as defined in `package.json`. Under the hood, it uses the popular [electron-packager](https://github.com/maxogden/electron-packager) module.

To create standalone binaries of your Ember App, simply run the following command.
```
ember electron:package
```

You can pass options to the packager by either putting configuration into your app's `package.json`, or by passing a command line parameter to the `ember electron:package` command. You can extend your existing `package.json` with all available configuration options by running `ember generate ember-electron`. In the case that an option is defined both on the command line and in the package.json, the command line option will be used.

* `--copy-files` - *String* An array of glob expressions, specifying which non-Ember files to copy to your application's folder. By default, only `package.json` and `electron.js` are copied. I heavily recommend specifying this setting in your `package.json`, using the format `{ "ember-electron": { "copy-files": ['myFiles/*'] }}`.
* `--dir` - *String* The source directory
* `--name` - *String* The application name.
* `--platform` - *String* Allowed values: *linux, win32, darwin, all*
* `--arch` - *String* Allowed values: *ia32, x64, all*
* `--version` - *String* Electron version (without the 'v') - for example, [`0.33.9`](https://github.com/atom/electron/releases/tag/v0.33.9), see [Electron releases](https://github.com/atom/electron/releases) for valid versions
* `--app-bundle-id` - *String* The bundle identifier to use in the application's plist (OS X only)
* `--app-category-type` - *String* The application category type, as shown in the Finder via *View -> Arrange by Application Category* when viewing the Applications directory (OS X only). For example, `app-category-type=public.app-category.developer-tools` will set the application category to *Developer Tools*. Valid values are listed in [Apple's documentation](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8).
* `--app-version` - *String* The release version of the application. Maps to the `ProductVersion` metadata property on Windows, and `CFBundleShortVersionString` on OS X.
* `--asar` - *Boolean* Whether to package the application's source code into an archive, using [Electron's archive format](https://github.com/atom/asar). Reasons why you may want to enable this feature are described in [an application packaging tutorial in Electron's documentation](http://electron.atom.io/docs/v0.36.0/tutorial/application-packaging/). Defaults to `false`.
* `--asar-unpack` - *String* A [glob expression](https://github.com/isaacs/minimatch#features), when specified, unpacks the file with matching names to the `app.asar.unpacked` directory.
* `--asar-unpack-dir` - *String* Unpacks the dir to `app.asar.unpacked` directory whose names exactly match this string. The `asar-unpack-dir` is relative to `dir`.
  For example, `asar-unpack-dir=sub_dir` will unpack the directory `/<dir>/sub_dir`.
* `--build-version` - *String* The build version of the application. Maps to the `FileVersion` metadata property on Windows, and `CFBundleVersion` on OS X.
* `--cache` - *String* The directory where prebuilt, pre-packaged Electron downloads are cached. Defaults to `$HOME/.electron`.
* `--helper-bundle-id` - *String* The bundle identifier to use in the application helper's plist (OS X only).
* `--icon` - *String* Currently you must look for conversion tools in order to supply an icon in the format required by the platform. If the file extension is omitted, it is auto-completed to the correct extension based on the platform.

  - OS X: `.icns`
  - Windows: `.ico` ([See below](#building-windows-apps-from-non-windows-platforms) for details on non-Windows platforms)
  - Linux: this option is not required, as the dock/window list icon is set via [the icon option in the BrowserWindow contructor](http://electron.atom.io/docs/v0.30.0/api/browser-window/#new-browserwindow-options). Setting the icon in the file manager is not currently supported.

* `--ignore` - *RegExp* A pattern which specifies which files to ignore when copying files to create the package(s). Take note that Ember Electron creates a temp folder containing `electron.js`, `package.json`, and Ember Cli's `dist` output folder.
* `--overwrite` - *Boolean* Whether to replace an already existing output directory for a given platform (`true`) or skip recreating it (`false`). Defaults to `false`.
* `--prune` - *Boolean* Runs [`npm prune --production`](https://docs.npmjs.com/cli/prune) before starting to package the app.
* `--sign` - *String* The identity used when signing the package via `codesign`. (Only for the OS X target platform, when XCode is present on the build platform.)
* `--strict-ssl` - *Boolean* Whether SSL certificates are required to be valid when downloading Electron. **Defaults to `true`**.
* `version-string` - *Object* Object hash of application metadata to embed into the executable (Windows only):
  - `CompanyName`
  - `LegalCopyright`
  - `FileDescription`
  - `OriginalFilename`
  - `ProductName`
  - `InternalName`

# Advanced Usage

## Conflict between Ember and Electron: require()
Both Ember Cli and Node.js use `require()`. Without ember-electron, Ember will start and overwrite Node's `require()` method, meaning that you're stuck without crucial tools such as `require('electron')`.

When using ember-electron, this conflict is automatically managed for you - you can continue to use Ember's `require()` for Ember Cli modules, but also use `requireNode()` for Node modules. The same is true for `window.module` (which is available as `window.moduleNode`) and `window.process` (which is available as `window.processNode`).

In addition, the `require()` method is overwritten to resolve both AMD and Node modules (see below) - however, to maintain code sanity, I recommend using `require()` and `requireNode()`.

## Creating Installers
Ember-Electron does currently not create installers for you, but plenty of modules exist to automate this task. For Windows installers, GitHub's very own [grunt-electron-installer](https://github.com/atom/grunt-electron-installer) does a great job. On OS X, you probably want to create a pretty DMG image - [node-appdmg](https://github.com/LinusU/node-appdmg) is a great command line tool to create images. If you'd like to follow GitHub's lead and stick with Grunt, consider [grunt-appdmg](https://www.npmjs.com/package/grunt-appdmg)

# License & Credits
MIT - (C) Copyright 2015 Felix Rieseberg and Microsoft Corporation. Please see `LICENSE` for details. Huge thanks to @brzpegasus (author of `ember-cli-nwjs`) - her project made the development of this project *a lot* easier.
