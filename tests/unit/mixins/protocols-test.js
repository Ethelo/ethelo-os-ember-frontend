import Ember from 'ember';
import ProtocolsMixin from '../../../mixins/protocols';
import { module, test } from 'qunit';

module('Unit | Mixin | protocols');

// Replace this with your real tests.
test('it works', function(assert) {
  var ProtocolsObject = Ember.Object.extend(ProtocolsMixin);
  var subject = ProtocolsObject.create();
  assert.ok(subject);
});
