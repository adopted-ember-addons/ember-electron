# Build pipeline
Ember-Electron's build pipeline consists of the following steps:

* Build Ember app (with Electron shimming/instrumentation)
* Assemble Electron project (compatible with [electron-forge](https://github.com/electron-userland/electron-forge))
* Package application binaries
* Make application installers

Each of these steps is broken into an Ember command and through its command-line
options can be configured to run all preceding pipeline steps, or to skip some
of the first steps, and use the output of a previous (partial) build. For
example the following would produce equivalent output:

```bash
$ ember electron:build --output-path electron-out/ember
$ ember electron:assemble --build-path electron-out/ember --output-path electron-out/project
```

and

```bash
$ ember electron:assemble --output-path electron-out/project
```

The only difference is that the latter command will build the Ember app into a
temp directory and delete it when it's done.

A similar example of equivalent commands that illustrates the entire pipeline
is:

```bash
$ ember electron:build --output-path electron-out/ember
$ ember electron:assemble --build-path electron-out/ember --output-path electron-out/project
$ ember electron:package --project-path electron-out/project
$ ember electron:make --skip-package
```

The `electron:make` command doesn't match the rest of them because
`electron-forge` handles reusing packaged output itself, so the semantics are a
little different.

Each build step will also accept an input path valid for any of the previous
steps. For example, the following are equivalent:

```bash
$ ember electron:build --output-path electron-out/ember
$ ember electron:make --build-path electron-out/ember
```

and

```bash
$ ember electron:make
```
