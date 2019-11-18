import Ember from 'ember';
import { module, test } from 'qunit';

const { ENV } = Ember;

module('ember-electron end-to-end test', function() {
  test('ember is available', function(assert) {
    assert.ok(Ember);
    assert.ok(ENV);
  });

  test('node modules are accessible', function(assert) {
    let sinon = requireNode('sinon');
    let stub = sinon.stub();
    stub();
    assert.ok(stub.calledOnce);
  });

  test('local modules are accessible', function(assert) {
    // ../../ because we are running out of ember/tests/index.html
    let helper = requireNode('../../ember-electron/lib/helper.js');
    assert.equal(helper(), 'helper');
  });
});
