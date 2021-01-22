# Using a Content Security Policy

You may have noticed Electron warns if you do not have a Content Security Policy setup.
This has been the case for quite awhile. To fix it, you may want to setup a CSP that
makes sense for your app.

First, you will need to install [ember-cli-content-security-policy](https://github.com/rwjblue/ember-cli-content-security-policy).

```bash
ember install ember-cli-content-security-policy
```

Then you should start by adding this default config to your `config/environment.js` file
and tweak it further for the needs of your app.

```js
contentSecurityPolicy: {
  'default-src': ["'none'"],
  'script-src': [
    'http://localhost:7020',
    'http://localhost:7357',
    'http://testemserver',
    "'self'",
    "'unsafe-inline'"
  ],
  'font-src': ["'self'"],
  'frame-src': ['http://localhost:7357', 'http://testemserver/', "'self'"],
  'connect-src': ["'self'"],
  'img-src': ['data:', "'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'media-src': ["'self'"]
},
contentSecurityPolicyMeta: true,
```

If you are using ember-auto-import or embroider you will also need to forbid eval there:

```js
autoImport: {
  forbidEval: true
},
```