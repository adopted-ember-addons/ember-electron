# Structure of an ember-electron app

## Electron apps

Electron apps consist of a main Node.js process that can spawn Chromium windows, called rendered processes, and load content into them. Those windows can load remote web pages, or local ones bundled with the Electron application, and they can be granted access to Node.js APIs so the code running in the browser windows can, for example, access the filesystem directly.

## Electron forge

[electron-forge](https://www.electronforge.io/) is a command-line interface for creating and managing Electron projects, analagous to `ember-cli` in the Ember ecosystem. You will not need to run `electron-forge` commands directly (although you can -- see below), but since most of the `ember electron:*` commands are wrappers for `electron-forge` commands, and `electron-forge` supports a very large set of configuration objects, it may be valuable to familiarize yourself with the basics of how `electron-forge` works.

## ember-electron apps

A vanilla `electron-forge` project contains some main process code and some static web content -- html, css, and js files. `ember-electron` integrates Ember with Electron by creating an `electron-forge` project inside your Ember project with some boilerplate main process code, and dynamically generated web content.

The boilerplate code is set up to load web content from a directory called `ember-dist` that doesn't (initially) exist. When you run the various `ember electron:*` commands, they build your Ember app, put the result inside the `ember-dist` directory, and then use the `electron-forge` API to launch your app with the now-populated web content.

### Project layout

When you first install `ember-electron`, the blueprint creates an `electron-forge` project in an `electron-app` folder. Here is layout of that project:

```
 my-app
 ├── app
 ├── tests
 ├── public
 ├── etc.
 └── electron-app
     ├── forge.config.js
     ├── package.json
     ├── node_modules
     ├── src
     │   │── handle-file-urls.js
     │   └── index.js
     ├── tests
     │   └── index.js
     ├── ember-dist
     │   └── <ember build output files>
     ├── ember-test
     │   └── <ember test build output files>
     └── out
         └── <output of package/make commands>
```

When you run your app, the working directory (`process.cwd()`) is `electron-app/`, and the Ember app's Node.js require location is `ember-dist`, meaning that if you add `src/some-lib.js` and want to require it from your Ember code, you would `requireNode('../src/some-lib.js')`.

### Dependencies: a tale of two package.jsons

Unlike `ember-electron` 2.x, the Electron app is a self-contained package, rather than being mixed in with the Ember app.

`my-app/package.json` should contain the dependencies needed for the Ember build -- all the standard Ember libraries and addons plus any that you want bundled into your application bundle. The packages specified in `my-app/package.json` will not be Node.js-requireable when you run your Electron application, but can only be accessed if they were injected into your Ember build using `ember-auto-import` or `app.import()` or the like.

`my-app/electron-app/package.json` should contain the dependencies needed for the Electron/`electron-forge` build plus any packages needed at runtime that you want to Node.js-require from the main process, or from your Ember app via `requireNode`.

Generally speaking:

* `my-app/package.json#devDependencies`:
** packages needed to perform the Ember build
** packages that contribute non-Node.js code used from the Ember app at runtime
** packages used for testing the Ember app
* `my-app/package.json#dependencies`:
** generally empty
* `my-app/electron-app/package.json#devDependencies`:
** `electron-forge` and related packages needed to perform the Electron build
** packages needed for testing the main process
* `my-app/electron-app/package.json#dependencies`:
** packages `require`ed by the main process at runtime
** packages `requireNode`ed by the Ember app (with `nodeIntegration: true`) at runtime

### Customizing the location of the Electron app

The `electron-app` folder name does not have a configuration option exposed, and so is not officially customizable.

However, it's still possible to override it within your Ember app using a tool like [patch-package](https://www.npmjs.com/package/patch-package). For example, creating a patch like this in `patches/ember-electron+3.1.0.patch`...

```patch
diff --git a/node_modules/ember-electron/lib/utils/build-paths.js b/node_modules/ember-electron/lib/utils/build-paths.js
index 84cfe86..3db9e14 100644
--- a/node_modules/ember-electron/lib/utils/build-paths.js
+++ b/node_modules/ember-electron/lib/utils/build-paths.js
@@ -1,6 +1,6 @@
 const path = require('path');

-const electronProjectPath = 'electron-app';
+const electronProjectPath = 'electron';

 const emberBuildDir = 'ember-dist';
 const emberBuildPath = path.join(electronProjectPath, emberBuildDir);
```

...will place the Electron app inside a folder called `electron` instead of `electron-app`.
