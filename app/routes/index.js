export default Ember.Route.extend({
  menu: Ember.inject.service(),

  afterModel(){
    if (this.get('session.decisionUserId')) {
      this.transitionTo('first');
    } else {
      this.transitionTo('login');
    }
  },

});
