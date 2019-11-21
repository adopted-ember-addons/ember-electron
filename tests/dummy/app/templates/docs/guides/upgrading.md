# Upgrading from ember-electron 2.x

While upgrading from 2.x to 3.x should not be very time-consuming in most cases, quite a bit has changed, so you should follow these steps in order to be successful. Starting from a clean tree (so you can run a clean `git diff` afterwards to see what changed), the recommended steps are:

## Upgrade ember electron

```sh
yarn-or-npm remove ember-electron
ember install ember-electron
```

When prompted to overwrite `testem-electron.js`, choose `yes`.

## Fix electron version

Your `electron-app` project will initially have the most recent release of Electron installed. You were probably running an older version since it was very difficult to run newer than Electron 4.x with `ember-electron` 2.x. So if you don't want to deal with upgrading Electron in the middle of upgrading `ember-electron`, you should change your `electron-app/package.json`'s `electron` version to match the version of `electron-prebuilt-compile` (which would determine the Electron version you were running) that is in your root `package.json`.

The good news is that now upgrading Electron just involves updating the version installed in the `electron-app` package -- no more waiting for `electron-prebuilt-compile` to release an update matching the latest Electron version!

## Clean up package.json

When installing `ember-electron` 2.x, a number of entries were added to your `package.json` that can now be safely removed:

`devDependencies`:
* `babel-plugin-transform-async-to-generator`
* `babel-preset-env`
* `babel-preset-react`
* `devtron`
* `electron-forge`
* `electron-prebuilt-compile`

`dependencies`:
* `electron-compile`
* `electron-protocol-serve`
* `electron-squirrel-startup`

and also the old `electron-forge` configuration:

```
"config": {
  "forge": "./ember-electron/electron-forge-config.js"
}
```

## Migrate Node.js packages

As described in [Guides: Structure](./structure), `ember-electron` 3.x differs from 2.x in that it doesn't mix the Electron app's `package.json` with the Ember app's `package.json`. So you'll need to identify any packages in your root `package.json` that are either `require()`ed by your Electron main process code, or `requireNode`ed by your Ember app and move or copy them into `electron-app/package.json`.

## Migrate main process/Node.js files

You will now have an `electron-app` folder with default vanilla content side-by-side with your `ember-electron` folder that stored your main process/Node.js files. So your next step is to migrate the contents of `ember-electron` over to `electron-app`.

### electron-forge-config.js

By default `electron-forge` puts the configuration inline in `package.json`, but still supports the external configuration. So you can either migrate the content of your `electron-forge-config.js` into `package.json`:

```
"config": {
  "forge": {
    "config goes": "here"
  }
}
```

or move your `electron-forge-config.js` from `ember-electron` to `electron-app` and then replace the `config` key in `electron-app/package.json` with

```
"config": {
  "forge": "./electron-forge-config.js"
}
```

Either way, you will need to update the configuration since the format has changed somewhat since the version of `electron-forge` that `ember-electron` 2.x used. Comparing your old configuration with the vanilla generated configuration in `electron-app/package.json` should help, and `electron-forge`'s [configuration documentation](https://www.electronforge.io/configuration) will help you through the process. Note also that the version of `electron-packager` uses changed from v11 to v14, and various maker packages were also updated, so there may be other configuration changes needed to be able to package/make with `ember-electron` 3.x.

### main.js

The equivalent of `ember-electron/main.js` is `electron-app/src/index.js`, so you'll want to put the contents of your `main.js` there (note that `src/index.js` is specified by the `main` entry in `electron-app/package.json`, so you can name it whatever/put it wherever you want as long as you update the `main` entry accordingy). Because the Electron project structure differs a little from `ember-electron` 2.x's, you'll need to replace anywhere you reference the path to the Ember application directory (`../ember`) with the new path (`../ember-dist`). For example, `ember-electron` 2.x's default `main.js` contains:

```javascript
protocolServe({
  cwd: join(__dirname || resolve(dirname('')), '..', 'ember'),
  app,
  protocol,
});
```

while `ember-electron` 3.x's contains:

```
protocolServe({
  cwd: join(__dirname || resolve(dirname('')), '..', 'ember-dist'),
  app,
  protocol,
});
```

### test-main.js

Generally you should not need to migrate `test-main.js` at all. It's default content in 2.x was:

```javascript
/* eslint-env node */
require('ember-electron/lib/test-support/test-main');
```

If yours still looks like that, then you don't need to do anything. If you've customized it, then you'll need to migrate the content to `electron-app/tests/index.js`

### resources-* folders

If you don't have any files in any of the `ember-electron/resources` or `ember-electron/resources-*` folders, you can skip this section.

`ember-electron` 2.x managed the `resources-*` folders to allow you to specify platform-specific resources. `electron-forge` does not support this functionality, and it was one of the main factors contributing to the complexity and slowness of `ember-electron` 2.x's build pipeline, so it's been removed in 3.x.

So if you only have content in `ember-electron/resources/`, you can just copy the folder into `electron-app`. Note that `src/index.js` is now in a subfolder, unlike `main.js` was in 2.x, so if you are accessing resources from your main process using, e.g., `path.join(__dirname, 'resources')`, you'll have to update it to `path.join(__dirname, '..', 'resources')` (or you could put the `resources` folder in the `src/` directory if you're some kind of monster).

If you do have content in the platform-specific `resources-*` folders, you can between them at runtime, e.g. put your platform-specific resources in `resources/win32`, `resources/darwin`, and `resources-linux` and:

```javascript
let resourcePath = path.join('..', 'resources', process.platform, 'thing.json.txt');
```

If you need to exclude files for other platforms from your packaged build, you can use `electron-forge`'s hooks, such as [packageAfterCopy](https://www.electronforge.io/configuration#packageaftercopy) (but note that these will only run when running `ember electron:package` or `ember electron:make`, not `ember electron` which runs directly out of your source tree).

### code/files/etc

Anything else that was in the `ember-electron` in 2.x should be "just files" -- `.js` files `require`d from the main process or `requireNode`d from the Ember app, or other files accessed via the filesystem APIs. So these can be migrated into `electron-app` however seems best, updating the references to their paths in other source files as needed.