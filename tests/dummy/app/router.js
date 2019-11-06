import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  docsRoute(this, function() {
    this.route('faq', function() {
      this.route('common-issues');
      this.route('security');
      this.route('structure');
      this.route('test-runner-deprecation');
    });

    this.route('guides', function() {
      this.route('build-pipeline');
      this.route('ci');
      this.route('configuration');
      this.route('installation');
      this.route('packaging');
      this.route('testing');
      this.route('upgrade');
      this.route('usage');
    });
  });
});

export default Router;
