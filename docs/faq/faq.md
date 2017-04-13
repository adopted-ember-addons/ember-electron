# Frequently Asked Questions

## What is electron-protocol-serve and why do I need this?

`electron-protocol-serve` is a module created for Ember-Electron, mimicking the behaviour Ember expects from a server. 
This allows Ember-Electron to load an Ember application without modifiying. 

This also migitates problems eisiting with XHR and the `file://` protocol, allows the application to have absolute paths, use `location: auto` and resolve just as if served from a static webserver. 

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
