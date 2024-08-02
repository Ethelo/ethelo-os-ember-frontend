import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    viewMore() {
      this.sendAction('viewMore');
    },
  }
});
