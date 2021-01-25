# Using a Content Security Policy

You may have noticed Electron warns if you do not have a Content Security Policy setup.
This has been the case for quite awhile. To fix it, you may want to setup a CSP that
makes sense for your app.

First, you will need to install [ember-cli-content-security-policy](https://github.com/rwjblue/ember-cli-content-security-policy).

We will need version 2.x, which you can install with:

```bash
ember install ember-cli-content-security-policy@2.0.0-2
```

Then you should start by adding this default config to your `config/content-security-policy.js` file
and tweak it further for the needs of your app.

```js
// config/content-security-policy.js

module.exports = function (environment) {
  return {
    delivery: ['meta'],
    enabled: environment !== 'test',
    failTests: true,
    policy: {
      'default-src': ["'none'"],
      'script-src': ['http://localhost:7020', "'self'", "'unsafe-inline'"],
      'font-src': ["'self'"],
      'frame-src': ["'self'"],
      'connect-src': ["'self'"],
      'img-src': ['data:', "'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'media-src': ["'self'"]
    },
    reportOnly: true
  };
};

```

If you are using ember-auto-import or embroider you will also need to forbid eval there:

```js
// auto-import
autoImport: {
  forbidEval: true
},
```

```js
// embroider
packagerOptions: {
  webpackConfig: {
    devtool: false
  }
}
```
