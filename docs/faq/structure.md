# File structure used and created by Ember-Electron

The `ember-electron` folder created at the root of your project by `ember-electron`'s blueprint looks like this:

```
 ember-electron
 ├── .compilerc
 ├── .electron-forge
 ├── lib
 │   └── index.js
 ├── resources
 ├── resources-darwin
 ├── resources-linux
 └── resources-win32
```

The `lib` directory is meant for code, and the `resources` directories are meant for non-code resources, such as images, json files, etc. The `resources-<platform>` directories exist so you can supply resources that will only be included on certain platforms, augmenting or replacing your platform-independent resources in `resources`. When the `ember electron` assembles your Electron project, it will look like this:

```
 ember-electron
 ├── .compilerc
 ├── package.json
 ├── .electron-forge
 ├── lib
 │   └── index.js
 ├── resources
 └── ember
     ├── index.html
     └── <the rest of your built ember app>
```

where `package.json` is copied from the root of your project (and slightly modified), `resources` is assembled as described, `ember` contains the built Ember app, and everything else is simply copied over from the `ember-electron` directory. Any other files or directories that you add to the `ember-electron` directory will be copied over as well, so you can include anything you want and it will be propagated into your Electron project and available at runtime.
