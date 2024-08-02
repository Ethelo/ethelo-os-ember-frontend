import Ember from 'ember';
import OptionSortByMixin from '../../../mixins/option-sort-by';
import { module, test } from 'qunit';

module('Unit | Mixin | option sort by');

// Replace this with your real tests.
test('it works', function(assert) {
  var OptionSortByObject = Ember.Object.extend(OptionSortByMixin);
  var subject = OptionSortByObject.create();
  assert.ok(subject);
});
