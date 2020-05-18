# Common Issues

## I can't open the Ember Inspector in the packaged app

This is known and desired behavior of Electron. The Developer Tools are still accessible programmatically or via a shortcut (see below). However, the packages needed for [DevTron](https://github.com/electron/devtron) and the [Ember Inspector](https://github.com/emberjs/ember-inspector) addons are not currently bundled with production builds.

### Open Developer Tools programmatically

In your ember-electron/main.js file, find the `BrowserWindow` that is being used to create the window of your app. You can open the developer tools programmatically by calling `openDevTools()` on its `webContents`.

```js
const myWindow = new BrowserWindow({});
myWindow.webContents.openDevTools();
```
