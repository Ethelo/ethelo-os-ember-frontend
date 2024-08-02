import Ember from 'ember';

export default Ember.Component.extend({
  variableSize: Ember.computed('size', function() {
    var size = this.get('size');
    if (size === 'large') {
      return 'modal-lg';
    } else if (size === 'small') {
      return 'modal-sm';
    } else {
      return false;
    }
  }),
});
