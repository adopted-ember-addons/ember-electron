# Common Issues

## I can't open the Developer Tools in the packaged app

This is known and desired behavior of Electron. If you really need the Inspector to be available in the packaged application, you can either open it programmatically or specify a menu item to open it via a shortcut.

### Open Inspector programmatically

In your ember-electron/main.js file, find the `BrowserWindow` that is being used to create the window of your app. You can open the developer tools programmatically by calling `openDevTools()` on its `webContents`.

```js
const myWindow = new BrowserWindow({});
myWindow.webContents.openDevTools();
```

## `ember-welcome-page` does not show in production mode

If you try out Ember-Electron for the first time on a brand new Ember project generated with `ember init`, you may find that the welcome page you see when running `ember electron` does no longer show up when you run an application packaged with `ember electron:package`.

While this might be a little confusing, it is the default behavior of the `ember-welcome-page` addon, which simply removes itself when run with the environment flag `--env=production`, which is our default while packaging applications.

Since you probably don't need that page anyway, you can savely follow it's own instructions and remove it from your `package.json` as well as the template tag `{{welcome-page}}` from your `app/templates/application.hbs`.
