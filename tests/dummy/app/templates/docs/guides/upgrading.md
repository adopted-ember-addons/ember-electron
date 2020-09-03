# Upgrading from ember-electron 2.x

While upgrading from 2.x to 3.x should not be very time-consuming in most cases, quite a bit has changed, so you should follow these steps in order to be successful. Starting from a clean tree (so you can run a clean `git diff` afterwards to see what changed), the recommended steps are:

## Upgrade ember electron

```sh
yarn-or-npm remove ember-electron
ember install ember-electron
```

When prompted to overwrite `testem-electron.js`, choose `yes`.

## Fix electron version

Your `electron-app` project will initially have the most recent release of Electron installed. You were probably running an older version since it was very difficult to run newer than Electron 4.x with `ember-electron` 2.x. So if you don't want to deal with upgrading Electron in the middle of upgrading `ember-electron`, you should change your `electron-app/package.json`'s `electron` version to match the version of `electron-prebuilt-compile` (which would determine the Electron version you were running) that is in your root `package.json`. Don't forget to run `yarn`/`npm install` from `electron-app` afterwards!

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
* `ember-inspector`

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

The equivalent of `ember-electron/main.js` is `electron-app/src/index.js`, so you'll want to put the contents of your `main.js` there (note that `src/index.js` is specified by the `main` entry in `electron-app/package.json`, so you can name it whatever/put it wherever you want as long as you update the `main` entry accordingly). Because the Electron project structure differs a little from `ember-electron` 2.x's, you'll need to replace anywhere you reference the path to the Ember application directory (`../ember`) with the new path (`../ember-dist`).

### test-main.js

Generally you should not need to migrate `test-main.js` at all. Its default content in 2.x was:

```javascript
/* eslint-env node */
require('ember-electron/lib/test-support/test-main');
```

If yours still looks like that, then you don't need to do anything. If you've customized it, then you'll need to migrate the content to `electron-app/tests/index.js`

### resources-* folders

If you don't have any files in any of the `ember-electron/resources` or `ember-electron/resources-*` folders, you can skip this section.

`ember-electron` 2.x managed the `resources-*` folders to allow you to specify platform-specific resources. `electron-forge` does not support this functionality, and it was one of the main factors contributing to the complexity and slowness of `ember-electron` 2.x's build pipeline, so it's been removed in 3.x.

So if you only have content in ember-electron/resources/, you can copy the folder into electron-app and ignore the other ember-electron/resources-* folders. Note that `src/index.js` is now in a subfolder, unlike `main.js` was in 2.x, so if you are accessing resources from your main process using, e.g., `path.join(__dirname, 'resources')`, you'll have to update it to `path.join(__dirname, '..', 'resources')` (or you could put the `resources` folder in the `src/` directory if you like, although many folks prefer to not mix their code with non-code resources.)

If you do have content in the platform-specific `resources-*` folders, you can choose between them at runtime, e.g. put your platform-specific resources in `resources/win32`, `resources/darwin`, and `resources-linux` and:

```javascript
let resourcePath = path.join('..', 'resources', process.platform, 'thing.json.txt');
```

If you need to exclude files for other platforms from your packaged build, you can use `electron-forge`'s hooks, such as [packageAfterCopy](https://www.electronforge.io/configuration#packageaftercopy) (but note that these will only run when running `ember electron:package` or `ember electron:make`, not `ember electron` which runs directly out of your source tree).

### code/files/etc

Anything else that was in the `ember-electron` in 2.x should be "just files" -- `.js` files `require`d from the main process or `requireNode`d from the Ember app, or other files accessed via the filesystem APIs. So these can be migrated into `electron-app` however seems best, updating the references to their paths in other source files as needed.

### electron-protocol-serve

Since 2.x, we have removed `electron-protocol-serve` from the default blueprint in favor of loading the Ember app using `file:` URLs. 
The instructions above should get you set up to run properly, but if your app has any references/assumptions around the URL used to load the Ember app, you'll need to update them. 
If you added `webSecurity: false` to work around issues caused by `electron-protocol-serve` (as described [here](/versions/v2.10.2/docs/faq/common-issues#what-is-electron-protocol-serve-and-why-do-i-need-this-)) you should be able to remove it now.

Another effect of switching from `serve:` URLs to `file:` URLs is that you may need to migrate data stored in browser storage such as `localStorage` or `IndexedDB` or your users could experience data loss. 
If a user has been running a version of your application that uses `serve:` URLs, then the browser will have any such data associated with the `serve://dist` domain, and the browser's security measures to prevent one site from accessing another site's will prevent your app, which accessed via a `file:` URL, from accessing the previously-created data.

Unfortunately, Electron doesn't currently provide any mechanisms to address this, so if your application has stored any 
such data on users' systems, and it's critical that it remain intact when the user updates to a version of the application 
that uses `file:` URLs, you'll have to migrate it. The following are examples of how you might migrate data for `localStorage` or `IndexedDB`.

#### localStorage migration

```javascript
// src/index.js
const { protocol, BrowserWindow } = require('electron');
const { promises: { writeFile } } = require('fs');
const { fileSync } = require('tmp');

function needsMigration() {
  // You'll want some way of determining if the migration has already happened,
  // the when the app starts it doesn't always re-copy the data from the
  // `serve://dist`-scoped, overwriting any changes the user has since made to
  // the `file:`-scoped data. For example, you might use `electron-store` to
  // keep track of whether you've run the migration or not.  
}

if (needsMigration()) {
  // Register the `serve:` scheme as privileged, like `electron-protocol-serve`
  // does. This enables access to browser storage from pages loaded via the
  // `serve:` protocol. This needs to be done before the app's `ready` event.
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'serve',
      privileges: {
        secure: true,
        standard: true
      }
    }
  ]);

  app.on('ready', async () => {
    // Set up a protocol handler to return empty HTML from any request to
    // `serve:` URLs, so we can load `serve://dist` in a browser window and use
    // it to access localStorage
    protocol.registerStringProtocol('serve', (request, callback) => {
      callback({ mimeType: 'text/html', data: '<html></html>' });
    });

    // Navigate to our empty page in a hidden browser window
    let window = new BrowserWindow({ show: false });
    try {
      await window.loadURL('serve://dist');

      // Get a JSON-stringified version of this origin's entire localStorage
      let localStorageJson = await window.webContents.executeJavaScript('JSON.stringify(window.localStorage)');

      // Create an empty HTML file in a temporary location that we can load via a
      // `file:` URL so we can write our values to the `file:`-scoped localStorage.
      // We don't do this with a protocol handler because we don't want to mess
      // with how `file:` URLs are handled, as it could cause problems when we
      // actually load Ember app over a `file:` URL.
      let tempFile = fileSync();
      await writeFile(tempFile.name, '<html></html>');
      await window.loadFile(tempFile.name);

      // Iterate over the values and set them in file:'s localStorage
      for (let [ key, value ] of Object.entries(JSON.parse(localStorageJson))) {
        await window.webContents.executeJavaScript(`window.localStorage.setItem('${key}', '${value}')`);
      }
    } finally {
      window.destroy();
    }
  });
}
```

#### IndexedDB migration

For migrating `IndexedDB` data, we are going to use the `indexeddb-export-import` package to assist us.

```javascript
// src/index.js
const { protocol, BrowserWindow } = require('electron');
const { promises: { writeFile } } = require('fs');
const { fileSync } = require('tmp');
const IDBExportImport = require('indexeddb-export-import');

function needsMigration() {
  // You'll want some way of determining if the migration has already happened,
  // the when the app starts it doesn't always re-copy the data from the
  // `serve://dist`-scoped, overwriting any changes the user has since made to
  // the `file:`-scoped data. For example, you might use `electron-store` to
  // keep track of whether you've run the migration or not.  
}

if (needsMigration()) {
  // Register the `serve:` scheme as privileged, like `electron-protocol-serve`
  // does. This enables access to browser storage from pages loaded via the
  // `serve:` protocol. This needs to be done before the app's `ready` event.
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'serve',
      privileges: {
        secure: true,
        standard: true
      }
    }
  ]);

  app.on('ready', async () => {
    // Set up a protocol handler to return empty HTML from any request to
    // `serve:` URLs, so we can load `serve://dist` in a browser window and use
    // it to access localStorage
    protocol.registerStringProtocol('serve', (request, callback) => {
      callback({ mimeType: 'text/html', data: '<html></html>' });
    });

    // Navigate to our empty page in a hidden browser window
    let window = new BrowserWindow({ show: false });
    try {
      await window.loadURL('serve://dist');
  
      // Export the existing IndexedDB data to a JSON string
      const jsonString = await window.webContents.executeJavaScript(
        `
        ${IDBExportImport.exportToJsonString.toString()}
  
        function getJsonForIndexedDb() {
          const DBOpenRequest = window.indexedDB.open('orbit', 1);
  
          return new Promise((resolve, reject) => {
            DBOpenRequest.onsuccess = () => {
              const idbDatabase = DBOpenRequest.result;
              exportToJsonString(idbDatabase, (err, jsonString) => {
                if (err) {
                  idbDatabase.close();
                  reject(err);
                } else {
                  idbDatabase.close();
                  resolve(jsonString);
                }
              });
            };
          });
        }
  
        getJsonForIndexedDb();
        `
      );
  
      // Create an empty HTML file in a temporary location that we can load via a
      // `file:` URL so we can write our values to the `file:`-scoped localStorage.
      // We don't do this with a protocol handler because we don't want to mess
      // with how `file:` URLs are handled, as it could cause problems when we
      // actually load Ember app over a `file:` URL.
      let tempFile = fileSync();
      await writeFile(tempFile.name, '<html></html>');
      await window.loadFile(tempFile.name);
  
      if (jsonString) {
        // Import the JSON backup into the new IndexedDB database
        await window.webContents.executeJavaScript(
          `
          ${IDBExportImport.importFromJsonString.toString()}
          ${IDBExportImport.clearDatabase.toString()}
          function restoreJsonForIndexedDb() {
            const DBOpenRequest = window.indexedDB.open('orbit', 1);
            return new Promise((resolve, reject) => {
              DBOpenRequest.onsuccess = () => {
                const idbDatabase = DBOpenRequest.result;
                clearDatabase(idbDatabase, (err) => {
                  if (!err) {
                    // cleared data successfully
                    importFromJsonString(
                      idbDatabase,
                      '${jsonString}',
                      (err) => {
                        if (!err) {
                          idbDatabase.close();
                          resolve();
                        } else {
                          reject(err);
                        }
                      }
                    );
                  } else {
                    reject(err);
                  }
                });
              };
            });
          }
          restoreJsonForIndexedDb();
        `
        );
      }
    } finally {
      window.destroy();
    }
  });
}
```

# Upgrading from 3.0.0-beta.2

Between `3.0.0-beta.2` and `3.0.0-beta.3` we removed `electron-protocol-serve` from the default blueprint as explained [here](#electron-protocol-serve). The best way to upgrade from a `3.0.0` beta version before `3.0.0-beta.3` is to:

1. Start with a clean working tree (no uncommitted changes)
2. Update `ember-electron` to the latest version
3. Rerun the blueprint (`ember g ember-electron`) overwriting all files when prompted
4. Look at the git diff and re-introduce any changes/customizations you previously made to the affected files
5. `cd electron-app && yarn remove electron-protocol-serve` since `electron-protocol-serve` is no longer used

The changes you should end up with are:

* Modifications to the `rootURL` and `locationType` settings in `config/environment.js`
* A new `electron-app/src/handle-file-urls.js` file
* Changes to `electron-app/src/index.js` and `electron-app/tests/index.js` to switch from `electron-protocol-serve` to `file:` URLs
* Removal of `electron-protocol-serve` from `electron-app/package.json`

If your application uses any browser storage like `localStorage` or `IndexedDB`, you may need to migrate the data so it's accessible from `file:` URLs -- make sure to read the [this](#electron-protocol-serve) section for more info.

You can read more about the removal of `electron-protocol-serve` and loading from `file:` URLs [here](../faq/routing-and-asset-loading).
