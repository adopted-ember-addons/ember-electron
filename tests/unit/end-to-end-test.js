import Ember from 'ember';
import { module, test } from 'qunit';

const { ENV } = Ember;

module('ember-electron end-to-end test', function() {
  test('ember is available', function(assert) {
    assert.ok(Ember);
    assert.ok(ENV);
  });

  test('node modules are accessible', function(assert) {
    let { fill } = requireNode('lodash/array');
    assert.deepEqual(fill([0, 0, 0], 1), [1, 1, 1]);
  });

  test('local modules are accessible', function(assert) {
    // ../../ because we are running out of ember/tests/index.html
    let helper = requireNode('../../ember-electron/lib/helper.js');
    assert.equal(helper(), 'helper');
  });
});
