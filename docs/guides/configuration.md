# Configuration

## electron-forge / electron-packager

You can pass options to the packager by either putting configuration into `ember-electron/electron-forge-config.js`, or by passing a command line parameter to the `ember electron:package` command. In the case that an option is defined both on the command line and in the `electron-forge-config.js`, the command line option will be used.

> :warning: The `electron-forge-config.js` file will be copied to a temporary folder during compilation, meaning that relative paths will be different. If you require resources from other folders (for intsance using a `require('../myscript')`, please do keep in mind that `electron-forge-config.js`.

* `--app-copyright` - *String* The human-readable copyright line for the app. Maps to the LegalCopyright metadata property on Windows, and NSHumanReadableCopyright on OS X.
* `--app-version` - *String* The release version of the application. Maps to the `ProductVersion` metadata property on Windows, and `CFBundleShortVersionString` on OS X.
* `--arch` - *String* Allowed values: *ia32, x64, all*

* `--asar` - *Boolean* Whether to package the application's source code into an archive, using [Electron's archive format](https://github.com/atom/asar). Reasons why you may want to enable this feature are described in [an application packaging tutorial in Electron's documentation](http://electron.atom.io/docs/v0.36.0/tutorial/application-packaging/). Defaults to `false`.

  - `ordering` - *String*: A path to an ordering file for packing files. An explanation can be found on the [Atom issue tracker](https://github.com/atom/atom/issues/10163).
  - `unpack` - *String*: A [glob expression](https://github.com/isaacs/minimatch#features), when specified, unpacks the file with matching names to the `app.asar.unpacked` directory.
  - `unpackDir` - *String*: Unpacks the dir to the `app.asar.unpacked` directory whose names exactly or pattern match this string. The `asar.unpackDir` is relative to `dir`.

  For example, `asar-unpack-dir=sub_dir` will unpack the directory `/<dir>/sub_dir`.

* `--build-version` - *String* The build version of the application. Maps to the `FileVersion` metadata property on Windows, and `CFBundleVersion` on OS X.
* `--copy-dev-modules` - *Boolean* Copy dependency node modules from local dev node_modules instead of installing them.

* `--defer-symlinks` - *Boolean* Whether symlinks should be dereferenced during copying (defaults to true)
* `--download` - *Object* If present, passes custom options to [`electron-download`](https://www.npmjs.com/package/electron-download)
(see the link for more detailed option descriptions and the defaults).

  - `cache` *String*: The directory where prebuilt, pre-packaged Electron downloads are cached.
  - `mirror` *String*: The URL to override the default Electron download location.
  - `strictSSL` *Boolean*: Whether SSL certificates are required to be valid when downloading Electron.

* `--dir` - *String* The source directory

* `--icon` - *String* Currently you must look for conversion tools in order to supply an icon in the format required by the platform. If the file extension is omitted, it is auto-completed to the correct extension based on the platform.

  - OS X: `.icns`
  - Windows: `.ico` ([See below](#building-windows-apps-from-non-windows-platforms) for details on non-Windows platforms)
  - Linux: this option is not required, as the dock/window list icon is set via [the icon option in the BrowserWindow contructor](http://electron.atom.io/docs/v0.30.0/api/browser-window/#new-browserwindow-options). Setting the icon in the file manager is not currently supported.

* `--ignore` - *RegExp* A pattern which specifies which files to ignore when copying files to create the package(s). Take note that Ember Electron creates a temp folder containing `electron.js`, `package.json`, and Ember Cli's `dist` output folder. Glob patterns will not work.
* `--name` - *String* The application name.
* `--out` - *String* The directory where electron builds are saved. Defaults to `electron-builds/`.
* `--overwrite` - *Boolean* Whether to replace an already existing output directory for a given platform (`true`) or skip recreating it (`false`). Defaults to `false`.
* `--platform` - *String* Target platform for build outputs. Allowed values: *linux, win32, darwin, mas, all*
* `--prune` - *Boolean* Runs [`npm prune --production`](https://docs.npmjs.com/cli/prune) before starting to package the app.
* `--version` - *String* Electron version (without the 'v') - for example, [`0.33.9`](https://github.com/atom/electron/releases/tag/v0.33.9), see [Electron releases](https://github.com/atom/electron/releases) for valid versions


### Used for macOS builds only

* `--app-bundle-id` - *String* The bundle identifier to use in the application's plist
* `--app-category-type` - *String* The application category type, as shown in the Finder via *View -> Arrange by Application Category* when viewing the Applications directory. For example, `app-category-type=public.app-category.developer-tools` will set the application category to *Developer Tools*. Valid values are listed in [Apple's documentation](https://developer.apple.com/library/ios/documentation/General/Reference/InfoPlistKeyReference/Articles/LaunchServicesKeys.html#//apple_ref/doc/uid/TP40009250-SW8).
* `--extend-info` - *String* Filename of a plist file; the contents are added to the app's plist. Entries in `extend-info` override entries in the base plist file supplied by electron-prebuilt, but are overridden by other explicit arguments such as `app-version` or `app-bundle-id`.
* `--extra-resource` - *String* Filename of a file to be copied directly into the app's Contents/Resources directory.
* `--helper-bundle-id` - *String* The bundle identifier to use in the application helper's plist.
* `--osx-sign` - *Object* If present, signs OS X target apps when the host platform is OS X and XCode is installed. When the value is true, pass default configuration to the signing module. The configuration values listed below can be customized when the value is an Object. See [electron-osx-sign](https://www.npmjs.com/package/electron-osx-sign#opts) for more detailed option descriptions and the defaults.

  - `identity` - *String*: The identity used when signing the package via codesign.
  - `entitlements` - *String*: The path to the 'parent' entitlements.
  - `entitlements-inherit` - *String*: The path to the 'child' entitlements.
* `--protocol` - *Array of strings* The URL protocol scheme(s) to associate the app with. For example, specifying `myapp` would cause URLs such as `myapp://path` to be opened with the app. Maps to the `CFBundleURLSchemes` metadata property. This option requires a corresponding `protocol-name` option to be specified.
* `--protocol-name` - *Strings* The descriptive name of the URL protocol scheme(s) specified via the `protocol` option. Maps to the `CFBundleURLName` metadata property.

### Used for Windows builds only

**Note:** Windows builds on non-Windows platforms require [Wine](https://www.winehq.org/) to be available on your PATH before the build/package step is executed.

* `--win32metadata` - *Object* Object hash of application metadata to embed into the executable (Windows only):

  - `CompanyName` - *String*
  - `LegalCopyright` - *String*
  - `FileDescription` - *String*
  - `OriginalFilename` - *String*
  - `ProductName` - *String*
  - `InternalName` - *String*
