# Common Issues

## What is electron-protocol-serve and why do I need this?

`electron-protocol-serve` is a module created for Ember-Electron, mimicking the behavior Ember expects from a server.
This allows Ember-Electron to load an Ember application without modifying.

This also mitigates problems existing with XHR and the `file://` protocol, allows the application to have absolute paths, use `location: auto` and resolve just as if served from a static webserver.

However this also means that if you want to access files on your local file system, they must be addressed using the the `file://` protocol. To access local files, the `BrowserWindow` has to be configured to load local files like this:

```js
mainWindow = new BrowserWindow({
    webPreferences: {
        webSecurity: false,
        allowRunningInsecureContent: false,
    }
});
```

This disables the same-origin policy, so this should done only after careful evaluation.

If you need to read a local file, using the [`FileReader`](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) API might be another good option that works without changing the `webPreferences`.


## When I make AJAX requests they fail due to CORS problems (`Access-Control-Allow-Origin` header)

This is also a side-effect of using `electron-protocol-serve`. One solution is to add an `Access-Control-Allow-Origin` header to the endpoint you are accessing, but that requires that you have control over that endpoint and that this fits with the security model of the server. Otherwise, this can be solved by setting `webPreferences` when opening your `BrowserWindow` as described above. However, this is only safe if you know you will never be running untrusted code in the `BrowserWindow` or allowing the `BrowserWindow` to navigate to a non-local URL.

The reason this is necessary has to do with Electron's configuration of WebKit. Electron sets the [allow_universal_access_from_file_urls](https://webkitgtk.org/reference/webkit2gtk/stable/WebKitSettings.html#WebKitSettings--allow-universal-access-from-file-urls), which disables the same-origin policy for Javascript loaded from `file:` URLs. However, since `electron-protocol-serve` causes us to load files from the custom `serve:` protocol, WebKit doesn't know that they are local files and enforces the same-origin policy by default, so we have to disable it using `webPreferences`.

You should carefully consider if doing this is safe, as it potentially opens up new security holes that vanilla Electron using `file:` URLs does not. The difference is that the `allow_universal_access_from_file_urls` option evaluates the situation on each request, and if the current origin isn't a `file:` URL, it will enforce the same-origin policy. When using `webPreferences` you are disabling the same-origin policy for the entire window, so if the window somehow navigates to an `http:` URL, the same-origin policy will still be disabled. So be sure to consider your circumstances carefully from a security standpoint when doing this, and ensure that if your window needs to display remote or untrusted content, it does so in a sandboxed `WebView`.


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

Since you probably don't need that page anyway, you can safely follow it's own instructions and remove it from your `package.json` as well as the template tag `{{welcome-page}}` from your `app/templates/application.hbs`.
