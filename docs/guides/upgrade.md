# Upgrades

Ember-Electron grew larger over time, and while we try to make updating this dependency
as easy as possible given the complex structure behind it there are still a few manual
steps required.

## Upgrading from 1.x to 2.x

First of all: Thank you so much for giving ember-electron a try. As the Electron community
grew bigger, more and more modules emerged that cover parts of the same operations done by
ember-electron - and over time it became clear that this module should depend on other, more
popular utility modules than to take care of all possible operations itself.

ember-electron v2 is almost a complete rewrite, utilizing electron-forge to build and package
your desktop applications. It allows ember-electron to focus on the Ember parts of this
module, while the whole Electron community can work together to polish the creation of installers,
the compilation of small packages, and the developer experience around native modules.

If you are upgrading to version 2.x from 1.x, you will need to make some updates to your
application. The best way to do this is to re-run the blueprint after upgrading
`ember-electron`:

```sh
ember generate ember-electron
```

## Configuration Upgrade
The biggest change is where your configuration lives - in the past, `ember-electron` managed your
configuration, passing it on to internal tools that would take care of the actual creation of
binaries.

Now, `ember electron:package` and `ember electron:make` use `electron-forge` to join forces with
the greater Electron community. All configuration is now done using an `electron-forge-config.js`
file inside your `ember-electron` folder. For details, [check out the documentation][forge-config].

## Example Upgrade
To see an upgrade in action, check out how Ghost Desktop [moved from ember-electron v1 to v2][ghost-pr].

[forge-config]: https://github.com/electron-userland/electron-forge#config
[ghost-pr]: https://github.com/TryGhost/Ghost-Desktop/pull/263
