# Usage

## Running Your App

To run your app together with a file watcher in development mode (similar to `ember serve`), you can run `ember electron`, which will use Electron to  start `ember-electron/main.js`. Electron's main process runs roughly like a Node process, meaning that it does not immediately open a browser window. This addon's blueprint adds a default `main.js` file to your project, which will automatically open up a new browser window with your Ember application.



## Ember Inspector

If you're running a later version of Electron, you will notice that ember-electron installs ember-inspector directly into Electron. Simply open up the developer tools and choose the Ember-tab, just like you would in Chrome.



## Debugging the Main Process

There are a variety of methods of debugging the main process. If you're on Electron 1.7.2 or newer, using the `--inspect`/`inspect-brk` flags is by far the best. You can read up on other methods [here](https://electron.atom.io/docs/tutorial/debugging-main-process/). Regardless of which method you use, you'll need to pass extra command-line options to Electron when launching. This can be done via the following syntax:

```
$ ember electron <ember electron args> --- <args to pass to Electron>
```

for example:

```
$ ember electron --- --inspect-brk
```

or:

```
$ ember electron --environment=production --- --debug-brk=5858
```

## Conflict between Ember and Electron: require()

Both Ember Cli and Node.js use `require()`. Without ember-electron, Ember will start and overwrite Node's `require()` method, meaning that you're stuck without crucial tools such as `require('electron')`.

When using ember-electron, this conflict is automatically managed for you. We provide save alternatives for
the methods and objects provided by Electron.

- `require()` is wrapped to resolve both Ember and Node modules, but we recommend you to use `requireNode()` for your Node dependencies.
- `window.module` becomes `window.moduleNode`
- `window.process` becomes `window.processNode`

While this should make it okay to continue using the default names, we recommend using our alternative ones for code clarity.
