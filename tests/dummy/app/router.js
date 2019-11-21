import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

export default class Router extends AddonDocsRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  docsRoute(this, function() {
    this.route('faq', function() {
      this.route('common-issues');
      this.route('security');
    });

    this.route('guides', function() {
      this.route('ci');
      this.route('common-issues');
      this.route('development-and-debugging');
      this.route('installation');
      this.route('security');
      this.route('structure');
      this.route('upgrading');
      this.route('usage');
    });
  });
});
