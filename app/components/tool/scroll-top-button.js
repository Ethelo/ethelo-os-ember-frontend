import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['col-md-2', 'text-center'],

  actions: {
    scrollTop() {
      window.scrollTo(0, 0);
    }
  }
});
