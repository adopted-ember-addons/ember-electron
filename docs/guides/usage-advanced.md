# Advanced Usage

## Running CI Tests on Travis CI, Circle CI, Jenkins and other headless systems
You can test your application using Electron with the `ember electron:test` command. However, because Chromium requires a display to work, you will need to create a fake display during your test in a headless environment like Travis CI or Circle CI. This addon automatically configures `.travis.yml`, but if you'd like to configure it manually, ensure that you take the following steps:

 * Install [`xvfb`](https://en.wikipedia.org/wiki/Xvfb). It's a virtual framebuffer, implementing the X11 display server protocol - it performs all graphical operations in memory without showing any screen output, which is exactly what we need. A [Jenkins addon is available](https://wiki.jenkins-ci.org/display/JENKINS/Xvfb+Plugin).
 * Create a virtual `xvfb` screen and export an environment variable called `DISPLAY` that points to it. Electron will automatically pick it up.
 * Install a recent C++ compiler (e.g. gcc). This is to enable the CI server to build native modules for Node.js.
 * Finally, ensure that `npm test` actually calls `ember electron:test`. You can configure what command `npm test executes` by changing it in your `package.json`.

On Travis, the configuration should look like this:

```yaml
env:
  - CXX=g++-4.8

addons:
  apt:
    sources:
      - ubuntu-toolchain-r-test
    packages:
      - xvfb
      - g++-4.8

before_install:
  - "npm config set spin false"

install:
  - npm install
  - export DISPLAY=':99.0'
  - Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
```



## Creating Installers

Ember-Electron does currently not create installers for you, but plenty of modules exist to automate this task. For Windows installers, GitHub's very own [grunt-electron-installer](https://github.com/atom/grunt-electron-installer) does a great job. On OS X, you probably want to create a pretty DMG image - [node-appdmg](https://github.com/LinusU/node-appdmg) is a great command line tool to create images. If you'd like to follow GitHub's lead and stick with Grunt, consider [grunt-appdmg](https://www.npmjs.com/package/grunt-appdmg).
