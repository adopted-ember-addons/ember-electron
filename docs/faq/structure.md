# File structure used and created by Ember-Electron

The `ember-electron` folder created at the root of your project by `ember-electron`'s blueprint looks like this:

```
 ember-electron
 ├── .compilerc
 ├── .electron-forge
 ├── main.js
 ├── resources
 ├── resources-darwin
 ├── resources-linux
 └── resources-win32
```

The `resources` directories are meant for non-code resources, such as images, json files, etc. The `resources-<platform>` directories exist so you can supply resources that will only be included on certain platforms, augmenting or replacing your platform-independent resources in `resources`. When the `ember electron` assembles your Electron project, it will look like this:

```
 ember-electron
 ├── package.json
 ├── .compilerc
 ├── ember
 │   ├── <ember build output>
 ├── ember-electron
 │   ├── electron-forge-config.js
 │   ├── main.js
 │   ├── resources
 │       ├── <file copied/merged from resources and resources-<platform>>
 │       ├── <file copied/merged from resources and resources-<platform>>
 ├── node_modules
     ├── <package.json deps>
```

- `package.json` is copied from the root of your project;
- `.compilerc` is copied from your ember-electron dir;
- `ember` contains the built Ember app; and
- `ember-electron` contains
    - `resources`, assembled as described; and
    - everything else in your ember-electron dir

If you want to see your assembled project to poke around or debug, you can run `ember electron:assemble` to generate it. Once generated, you can run it using electron forge:

```
$ ./node_modules/.bin/forge -p electron-out/project start
```
