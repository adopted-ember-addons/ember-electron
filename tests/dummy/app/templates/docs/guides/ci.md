# Running CI Tests on Travis CI, Circle CI, Jenkins and other headless systems

You can test your application using Electron with the `ember electron:test` command. However, because Chromium requires a display to work, you will need to create a fake display during your test in a headless environment like Travis CI or Circle CI. This addon automatically configures `.travis.yml`, but if you'd like to configure it manually, ensure that you take the following steps:

 * Install [`xvfb`](https://en.wikipedia.org/wiki/Xvfb). It's a virtual framebuffer, implementing the X11 display server protocol - it performs all graphical operations in memory without showing any screen output, which is exactly what we need. A [Jenkins addon is available](https://wiki.jenkins-ci.org/display/JENKINS/Xvfb+Plugin).
 * Create a virtual `xvfb` screen and export an environment variable called `DISPLAY` that points to it. Electron will automatically pick it up.
 * Finally, ensure that `npm test` or `yarn test` actually calls `ember electron:test`. You can configure what command `npm test executes` by changing it in your `package.json`.

When you first install `ember-electron`, the blueprint will update your .travis.yml, but if it fails or you need to do it manually for some reason, your configuration should include the following:

```yaml
addons:
  apt:
    packages:
      - xvfb

install:
  - <npm or yarn install>
  - export DISPLAY=':99.0'
  - Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
```
