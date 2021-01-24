# Routing and Asset Loading

This is a bit of a deep dive into how we make Ember's routing and asset loading work properly when running in an Electron application, along with a discussion of some possible alternatives. This all stems from the fact that in an Electron application we load the Ember app using a `file:` URL rather than an `http:` URL.

## Routing

Let's say our app uses the default `history` (or `auto`) location type, and has the following routes:

```javascript
Router.map(function() {
  this.route('my-route');
});
```

and we deploy it to `http://my-app.com`. This means that the URL `http://my-app.com/` corresponds to the `index` route, and `http://my-app.com/my-route` corresponds to the `my-route` route. The way this is achieved is that whatever web server is serving the Ember app is typically configured to return the Ember app's `index.html` for any requests to `http://my-app.com/<subpath>`, and `index.html` loads all the Javascript for the application, including Ember itself. Then Ember's routing code looks at the URL path and activates the corresponding route. So the web server combined with Ember's `history` location/routing code creates an abstraction layer that interprets logical locations, in the form of the URL path, resolves them all to the same `index.html` file, but in a way that exposes that logical location to Ember so it can activate the correct route.

When running an Electron app, we serve the files out of the filesystem using a `file:` URL, which doesn't give us the flexibility of a web server -- the URL path cannot be a logical location, but must be a filesystem path that points directly to `index.html`. For example, when running a development build, the path might be `file:///Users/me/projects/my-app/electron-app/ember-dist/index.html`. We can't use the URL path to specify the Ember route because telling the browser to load `file:///Users/me/projects/my-app/electron-app/ember-dist/index.html/my-route` will not work -- it will look for a file named `my-route` inside a directory named `index.html`, and won't find it.

So we have to go back to an older method of specifying logical locations, which is to use the URL hash. Fortunately, Ember supports this via the [HashLocation](https://api.emberjs.com/ember/release/classes/HashLocation) since that was the only option in older browsers. Since URL hashes don't affect how `file:` URLs are resolved to paths, we can tell the browser to load `file:///Users/me/projects/my-app/electron-app/ember-dist/index.html#/my-route`, and it will load the `index.html` and then Ember can resolve the route using the path contained in the URL hash.

This is why `ember-electron`'s blueprint configures the application's `config/environment.js` with the following entry:

```javascript
locationType: process.env.EMBER_CLI_ELECTRON ? 'hash' : 'auto',
```

This way when building for Electron, the app will be configured to use the hash location, and if the app is also built for a browser, it will use the default auto location (which detects and chooses a location type based on browser capabilities).

## Asset loading

Ember apps typically load their assets using relative URLs with absolute paths, e.g. `<script src="/assets/app.js"></script>` or `<img src="/img/logo.jpg">`. The browser combines these with the current location to generate the URL from which to load the asset. So if our current URL is `http://my-app.com`, our example assets URLs would resolve to `http://my-app.com/assets/app.js` and `http://my-app.com/img/logo.jpg`. Even if our current URL is `http://my-app.com/my-route`, they will resolve to those same URLs, because of the fact that the asset URL paths are absolute, i.e. start with `/`, so when combined with the current URL, the asset path replaces the URL path, rather than being appended to it.

With `file:` URLs, though, this won't work because, following those same rules, combining `file:///Users/me/projects/my-app/electron-app/ember-dist/index.html` with `/assets/app.js` will result in `file:///assets/app.js`, not `file:///Users/me/projects/my-app/electron-app/ember-dist/assets/app.js`, which is where `app.js` actually lives. HTML loaded from the filesystem typically uses relative URLs to get around this, i.e. if we had `<script src="assets/app.js"></script>` or `<img src="img/logo.jpg">` (note that there are no leading `/`s), then the paths would be interpreted as relative to the current directory, and would resolve to the correct `file:` URLs.

### Javascript and CSS

For `app.js` and other scripts and CSS loaded out of `index.html`, we have a nice solution for making the URL paths relative. The Ember app's `index.html` specifies them using a `rootURL` template parameter, e.g. `<script src="{{rootURL}}assets/app.js"></script>`, which is resolved during the Ember build. The default `rootURL` for Ember apps is `/`, so it would end up being `<script src="/assets/app.js"></script>`. But we can set the `rootURL` to `''`, causing it to end up being `<script src="assets/app.js"></script>` -- a relative path, which is exactly what we want. This is why `ember-electron`'s blueprint configures the application's `config/environment.js` with the following:

```javascript
rootURL: process.env.EMBER_CLI_ELECTRON ? '' : '/',
```

There is an additional wrinkle when running tests. Since Ember puts the `index.html` used for tests at `tests/index.html`, it actually needs assets paths that look like `../assets/app.js`. However, `ember-cli` ([clean-base-url](https://github.com/ember-cli/clean-base-url) actually) forces a non-empty `rootURL` to start with `/`, so `ember-electron` uses the broccoli pipeline to modify these URLs in `tests/index.html` to start with `../`.

### Other assets (images, fonts, etc.)

Unfortunately, this approach will not work for images and other such assets that don't start with `rootURL`, like our `<img src="/img/logo.jpg">` example. To solve this case, we do a little trickery in the main process. Electron allows us to intercept requests from the browser, so we use [protocol.interceptFileProtocol](https://www.electronjs.org/docs/api/protocol#protocolinterceptfileprotocolscheme-handler-completion) to intercept requests for `file:` URLs, look at their paths, and determine if they look like asset paths. To accomplish this, `ember-electron`'s blueprint creates a `electron-app/src/handle-file-urls.js` that sets this up, and calls into it from the main process code -- `electron-app/src/index.js` and `electron-app/tests/index.js`.

This request intercepting code extracts the requested URL path, appends it to the path to the root of the Ember app, and then looks to see if the result is the path to a file inside the Ember app. If so, it resolves the request to that file. If not, it resolves it to the full requested (absolute) path.

This is not perfect -- there is a concievable case where it could do the wrong thing, which is if the URL path pointed to a file when interpreted either as absolute or relative to the Ember app. For example, if you put `images/foo.jpg` in your Ember app's `public` directory, then a request for `/images/foo.jpg` would resolve to it. If for some reason the application were trying to load `/images/foo.jpg` from the root of the filesystem (i.e. you have a top-level directory called `images` and the app expects it to contain `foo.jpg`), it would resolve to the one inside the Ember app, and the application would have no way to load the one at the root of the filesystem. This seems like a very unlikely use case, though -- applications that load files from the filesystem generally do it through node APIs, not in-browser requests.

### Source maps

One might observe that the solution for images, fonts, etc., could also apply to the Javascript and CSS, and wonder why we need both solutions. The answer is source maps. Unfortunately when the Chromium developer tools load source maps, it is not intercept-able by the Electron `protocol` module, and the developer tools are not aware of any intercepting that happens in the main process. So if we left the leading `/` on the script tags, e.g. `<script src="/assets/app.js"></script>`, then when the developer tools sees the `sourceMappingURL=app.map` at the end of `app.js` it will treat `app.map` as a path that is relative to where it thinks the script was loaded from, i.e. `/assets/app.js`, so it will try to load it from `/assets/app.map`. Since this request isn't intercept-able, the source maps will fail to load. So to make source maps work, we really need to load the Javascript and CSS files from relative URLs, and since we cannot easily rewrite the other assets' URLs to be relative, we need two different solutions for the two different flavors of assets.

## Alternatives

We've investigated a number of alternatives, but none of them seemed better than the existing solution. They are listed here for posterity, and in case things change in the future and/or somebody wants to try them out or figure out how to adapt them into a better solution, or simply finds that one of them better fits their application's specific use cases -- each of these alternatives is viable, just with certain drawbacks.

### electron-protocol-serve

[electron-protocol-serve](https://github.com/bendemboski/electron-protocol-serve) was an ingenious method of implementing an abstraction layer similar to a web server, that solved the routing problem, and both flavors of the asset loading problem. Unfortunately, it ended up being too far off the beaten path of Electron patterns. Electron and Chromium both apply less security/sandboxing when the HTML is loaded from a `file:` URL, so various common Electron application patterns would not work without manually disabling certain browser security measures when loading from non-`file:` URLs. But the bigger problem was that starting with Electron 7, and due to some changes in Chromium, it could no longer load source maps when using `electron-protocol-serve` (see [this issue](https://github.com/electron/electron/issues/21699)).

Note that this is fundamentally the same reason why we need different solutions for Javascript/CSS and other assets -- see above.

### use a web server

It would certainly be possible to bundle `express` or some other web server with an Electron app, configure it to serve the Ember app, and then load the app over HTTP rather than using `file:` URLs. This would also solve the routing problem and both flavors of the asset loading problem, but would also have one of the same drawbacks as `electron-protocol-serve` did, which is that the app would run at the higher level of security/sandboxing applied by Chromium and Electron to apps loaded via non-`file:` URLs. But also, in addition to straying from the Electron beaten path, running a web server seems like a pretty high-runtime-overhead approach to be our out-of-box solution, so we've opted for something lighter-weight.

### leverage broccoli-asset-rev

`broccoli-asset-rev` is a `brocolli` plugin that rewrites asset paths to add cache-busting fingerprints and also prepend CDN URLs, so while it wouldn't help with the routing problem, it is fundamentally attacking the same problem that we're trying to attack of rewriting the URLs of all of an Ember application's assets. Unfortunately, we can't really use it as intended -- it's built to accept static CDN URLs that are the same for every user of the application, and are known at Ember build time. We cannot prepend absolute `file:` URLs to our asset paths because this prepending happens at Ember build time, and we don't know the absolute filesystem path to the application until it's installed on the user's system.

One option would be to specify `./` as the prepend URL, which would convert the asset paths into relative paths. This almost works, but unfortunately is again a bit too far off the beaten path -- `broccoli-asset-rev` was not written with relative URLs in mind, so things don't quite work. An initial stab is adding this to `ember-cli-build.js`:

```javascript
fingerprint: {
  enabled: process.env.EMBER_CLI_ELECTRON || process.env.EMBER_ENV === 'production',
  prepend: './'
}
```

This fixes all the asset paths to load into the browser, but leaves sourcemaps broken. The reason is that `broccoli-asset-rev` also rewrites source map URLs expecting them to be absolute. So if `prepend` is `http://cdn.com/`, then it would expect `app.map` to be at `http://cdn.com/assets/app-<hash>.map`, and would rewrite the `sourceMappingURL=app.map` at the end of `app.js` to be `sourceMappingURL=http://cdn.com/assets/app-<hash>.map`. This is fine for prepending absolute URLs, but if we prepend `./`, then it ends up rewriting the source map URL as `sourceMappingURL=./assets/app-<hash>.map`. But since both `app-<hash>.js` and `app-<hash>.map` end up in the same directory, and the `sourceMappingURL` is interpreted relative to where `app.js` is, it resolves to `.../ember-dist/assets/assets/app-<hash>.map`. `broccoli-asset-rev` simply doesn't expect or handle relative `prepend` URLs.

This could potentially be fixed by broccoli'ing the map files into `assets/assets`, or using the broccoli pipeline to rewrite the `assets/assets/` to just be `assets/`, but then we're kinda layering kludges, and it really doesn't seem like the way to go. It can also be partially fixed by changing the fingerprint config to

```javascript
fingerprint: {
  enabled: process.env.EMBER_CLI_ELECTRON || process.env.EMBER_ENV === 'production',
  extensions: [ 'js', 'css', 'png', 'jpg', 'gif' ],
  prepend: './'
}
```

where the `extensions` array includes all default asset types except `map`, i.e. disables rewriting the map files so the `sourceMappingURL`s in the Javascript files are not modified...but it appears that `broccoli-asset-rewrite` has a bug where if we have CSS sourcemaps, the fact that we're rewriting `.css` files causes it to incorrectly recognize the `my-app.css` substring of `sourceMappingURL=my-app.css.map` as a reference to the CSS file and rewrite it...so further evidence that we're wandering off the beaten path.


### change assets paths to be relative

One other fix for asset loading is to simply make all the asset paths relative, e.g. change `<img src="/img/logo.jpg">` to `<img src="img/logo.jpg">`. However, this will not work if the Ember app is also built to run in the browser without some similar acrobatics as described above to re-introduce the `/` or prepend a CDN URL, and it also assumes that the application author has control over all of the markup, which may not be the case if they use third-party addons for UI.