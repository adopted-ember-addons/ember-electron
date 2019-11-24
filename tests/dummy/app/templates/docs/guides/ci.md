# Running CI Tests on Travis CI, Circle CI, Jenkins and other headless systems

To run Electron tests in CI, you need to run the `ember electron:test` command. But some additional setup is usually required.

## Installing Electron dependencies

In CI you'll need to make sure that you've installed your Electron app dependencies as well as your Ember dependencies, which means running `yarn` or `npm install` in `electron-app/`. `ember-electron`'s blueprint sets this up for you in `.travis.yml`, but if it fails, or you use a different CI provider, or you want to configure it manually, you'll need to add something like

```sh
cd electron-app && yarn
```

or

```sh
cd electron-app && npm install
```

## Setting up a virtual display

Because Chromium requires a display to work, you will need to create a fake display during your test in a headless environment like Travis CI or Circle CI. `ember-electron`'s blueprint sets this up for you in `.travis.yml`, but if it fails, or you use a different CI provider, or you want to configure it manually, ensure that you take the following steps:

 * Install [`xvfb`](https://en.wikipedia.org/wiki/Xvfb). It's a virtual framebuffer, implementing the X11 display server protocol - it performs all graphical operations in memory without showing any screen output, which is exactly what we need. A [Jenkins addon is available](https://wiki.jenkins-ci.org/display/JENKINS/Xvfb+Plugin).
 * Create a virtual `xvfb` screen and export an environment variable called `DISPLAY` that points to it. Electron will automatically pick it up.

## .travis.yml

The result of both of the above steps will look something like this in `.travis.yml`:

```yaml
addons:
  apt:
    packages:
      - xvfb

install:
  - <npm or yarn install>
  - cd electron-app && <npm or yarn install>
  - export DISPLAY=':99.0'
  - Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
```
