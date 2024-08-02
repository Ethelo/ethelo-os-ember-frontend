import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    hideAll() {
      this.sendAction('hideAll');
    },
  }
});
