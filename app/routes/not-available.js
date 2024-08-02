import Registry from 'frontend/mixins/registry';

export default Ember.Route.extend(Registry, {
  menu: Ember.inject.service(),

  redirect: function(model, transition) {
    /* redirect immediately if current route is 'not-available'
    and no queryParams has been passed when transition */

    /* For unavailable decision at 'not-available' route:
    in case when queryParams has been passed try to redirect immediately
    and if not succeded try to redirect after interval */
    if (window.location.pathname === '/not-available' && !transition.queryParams.timeStamp) {
      this.transitionTo('first');
      return;
    }
  },

  actions: {
    didTransition() {
      Ember.run.later(() => {
        // redirect to the first page , not to 'first' route, otherwise it will go back and forth
        let first = this.get('menu.firstPage');
        if (first) {
          this.transitionTo('page', first);
        }
        window.location.reload(true);
        return this.get('registry').loadDecision();
      }, 60000 * 5);

      return true;
    }
  }

});
