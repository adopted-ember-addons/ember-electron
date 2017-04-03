# Upgrades

Ember-Electron grew larger over time, and while we try to make updating this dependency
as easy as possible given the complex structure behind it there are still a few manual
steps required.

## Upgrading from 1.x to 2.x

First of all: Thank you so much for giving ember-electron a try. As the Electron community
grew bigger, more and more modules emerged that cover parts of the same operations done by
ember-electron - and over time it became clear that this module should depend on other, more
popular utility modules than to take care of all possible operations itself.

ember-electron v2 is almost a complete rewrite, utilitizing electron-forge to build and package
your desktop applications. It allows ember-electron to focus on the Ember parts of this
module, while the whole Electron community can work together to polish the creation of installers,
the compilation of small packages, and the developer experience around native modules.

If you are upgrading to version 2.x from 1.x, you will need to make some updates to your
application. The best way to do this is to re-run the blueprint after upgrading
`ember-electron`:

```sh
ember generate ember-electron
```

- New project structure
- Added dependencies
- ...
