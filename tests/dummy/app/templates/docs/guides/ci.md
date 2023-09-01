# Running tests in CI

To run Electron tests in CI, you need to run the `ember electron:test` command. But some additional setup is usually required.

## Installing Electron dependencies

In CI you'll need to make sure that you've installed your Electron app dependencies as well as your Ember dependencies, which means running `yarn` or `npm install` in `electron-app/`. So whatever mechanism you use in CI for installing your node dependencies at the root of your project, you should also use to install dependencies in `electron-app/`.

## Setting up a virtual display

Because Chromium requires a display to work, you will need to create a fake display during your test in a headless environment like Github actions. To do that you'll need to:

 * Install [`xvfb`](https://en.wikipedia.org/wiki/Xvfb). It's a virtual framebuffer, implementing the X11 display server protocol - it performs all graphical operations in memory without showing any screen output, which is exactly what we need. A [Jenkins addon is available](https://wiki.jenkins-ci.org/display/JENKINS/Xvfb+Plugin).
 * Create a virtual `xvfb` screen and export an environment variable called `DISPLAY` that points to it. Electron will automatically pick it up.

 If you're using GitHub actions, you can do both of these using the `GabrielBB/xvfb-action` action by doing something like:

```yaml
    steps:
      # ...
      - name: Run Tests
        uses: GabrielBB/xvfb-action@v1
        run: npm test
```
