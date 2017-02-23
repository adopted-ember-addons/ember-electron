import Ember from 'ember';
import { module, test } from 'qunit';

module("ember-electron end-to-end test");

test('ember is available', function(assert) {
  assert.ok(Ember);
  assert.ok(Ember.ENV);
});

test('node modules are accessible', function(assert) {
  let { fill } = requireNode('lodash/array');
  assert.deepEqual(fill([ 0, 0, 0 ], 1), [ 1, 1, 1 ]);
});
