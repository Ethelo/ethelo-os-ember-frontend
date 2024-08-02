import LoggedInRoute from './logged-in';
import Registry from 'frontend/mixins/registry';

// this is run before any of the project-user sub routes
export default LoggedInRoute.extend(Registry, {
  menu: Ember.inject.service(),

  model() {
    let first = this.get('menu.firstPage');
    if (first) {
      this.transitionTo('page', first);
    }
    return this.get('registry').loadDecision();
  },
  afterModel: function(/*model , transition*/) {
    let first = this.get('menu.firstPage');
    if (first) {
      this.transitionTo('page', first);
      return;
    }
    this.transitionTo('not-available', {queryParams: {timeStamp: Date.now()}});
  },

});
