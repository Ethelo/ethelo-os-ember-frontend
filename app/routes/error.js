export default Ember.Route.extend({
  analytics: Ember.inject.service(),
  actions: {
    didTransition() {
      this.get('analytics').sendPageView('/error', 'Error');
      return true;
    }
  },
  setupController(controller, model) {
    // model is the error
    controller.set('model', model);

    // for 401 (unauthorized) errors, wait a second for the error message to show, then redirect
    if (model.status === 401) {
      setTimeout(function() {
        window.location.replace(this.get('session.EtheloServer') + '/');
      }, 100);
    }
  }
});
