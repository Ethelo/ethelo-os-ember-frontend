import Ember from 'ember';
import ValidatorsMixin from '../../../mixins/validators';
import { module, test } from 'qunit';

module('Unit | Mixin | validators');

// Replace this with your real tests.
test('it works', function(assert) {
  var ValidatorsObject = Ember.Object.extend(ValidatorsMixin);
  var subject = ValidatorsObject.create();
  assert.ok(subject);
});
