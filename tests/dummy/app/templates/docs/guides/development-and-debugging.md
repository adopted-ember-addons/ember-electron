# Development and Debugging

## require() and requireNode()

TL;DR is to use `requireNode()` instead of `require()` when requiring node modules from your Ember application.

Ember defines its own global `require` function for requiring transpiled Ember modules from the application bundle, which overwrites Electron's `require` function that is used to require Node.js modules out of `node_modules` or by relative path.

`ember-electron` attempts to patch this up by implementing a `require()` function that tries both Ember's and Node.js's `require()` functions, but it's not perfect, so we recommend you use `requireNode()` when requiring Node.js modules.

## Command-line arguments

If your Electron app accepts command-line arguments that the main process handles via `process.argv`, then when running `ember electron` you need to precede them with `---`. This allows the `ember electron` to distinguish between its own arguments and arguments it should pass through when launching Electron:

```sh
$ ember electron <ember electron args> --- <args to pass to Electron>
```

e.g.

```sh
$ ember electron --- --some-flags --that-my-app --handles-as="process.argv"
```

or

```sh
$ ember electron --environment=production --- --some-flags --that-my-app --handles-as="process.argv"
```

## Developing main process code

`ember-electron` does not restart your Electron app when main process code changes, so after making a code change you need to quit and re-launch your application. If you just run `ember electron` each time and you aren't changing any Ember code, you'll have to unnecessarily wait through the Ember build process that `ember electron` automatically runs. To avoid this, you can

```sh
ember build
```

which will build the Ember app and put the results inside the Electron app, making it a fully-built like `electron forge` expects. Then you can

```sh
cd electron-app
yarn start # or npm run start
```

which will run Electron forge's start script (`electron-forge start`). When you need to quit and relaunch, you can just re-run the start script and skip the Ember build entirely.

Note that once you've `ember build`ed, you can also run the `package`, `make`, or `start` scripts, or any [electron-forge commands](https://www.electronforge.io/cli#commands) you like, as you're in a fully set up `electron-forge` project.

## Debugging the Main Process

Unless you're on really old Electron (`<2`), you can [debug the main process](https://electron.atom.io/docs/tutorial/debugging-main-process/) using the `--inspect`/`inspect-brk` flags. The above syntax (`---`) can also be used to pass arguments to electron itself:

```sh
$ ember electron --- --inspect-brk
```

or:

```sh
$ ember electron --- --inspect-brk --some-flags --that-my-app --handles-as="process.argv"
```

Then, like when inspecting any Node.js process, open Chrome and navigate to `chrome://inspect`.
