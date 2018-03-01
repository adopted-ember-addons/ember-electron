# Security concerns

## How can I address the "Insecure Content-Security-Policy" warning?

If you create a new `ember-electron` application using
`ember new my-app` and `ember install ember-electron`
and then run `ember electron` you may (if using Electron 2.0 or newer)
see a warning message in the console like this:
![Electron Security Warning (Insecure Content-Security-Policy) This renderer process has either no Content Security Policy set or a policy with "unsafe-eval" enabled. This exposes users of this app to unnecessary security risks. For more information and help, consult https://electronjs.org/docs/tutorial/security. This warning will not show up once the app is packaged.](images/warn-insecure-csp.png)

This warning is regarding not having defined a strict [`Content-Security-Policy` (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).
Since this is a general concern for all Ember applications and all Electron applications,
`ember-electron` itself does not make any changes regarding the application's CSP.  
The [`ember-cli-content-security-policy` addon](https://github.com/rwjblue/ember-cli-content-security-policy)
is designed to make it easier to specify a `Content-Security-Policy` for Ember applications,
and we recommend that developers using `ember-electron` use it to specify appropriate CSP directives.

As an electron application developer, you should familiarize yourself with
known risks and their corresponding mitigation techniques.
Some good resources for getting started are the
[Electron security tutorial](https://electronjs.org/docs/tutorial/security)
and the MDN [Web security landing page](https://developer.mozilla.org/en-US/docs/Web/Security).

### TL;DR

* `ember install ember-cli-content-security-policy`
* Add the following to `ENV` (in `config/environment.js`):
```js
  // ember-cli-content-security-policy
  contentSecurityPolicy: {
    'default-src': ["'none'"],
    'script-src': ["'self'"],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'img-src': ["'self'"],
    'style-src': ["'self'"],
    'media-src': ["'self'"]
  },
  contentSecurityPolicyMeta: true,
```
* Run `ember electron` and check the console for errors (i.e. violations of the newly defined Content-Security-Policy)
  e.g. `Refused to load...because it violates the following Content Security Policy directive:...`
* If there are no problems then you are done.
  Otherwise, you'll need to examine the code in violation and either make it compliant or adjust the policy to allow it.  
