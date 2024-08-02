import TransitionToListenerRoute from 'ember-cli-routing-service/routes/transition-to-listener';

export default TransitionToListenerRoute.extend({
  authService: Ember.inject.service('authentication'),
  registry: Ember.inject.service(),
  menu: Ember.inject.service(),
  beforeModel(transition) {
    this.saveReferrers(transition);
    if (!this.get('session.decisionId')) {
      window.location.href = this.get('registry.session.adminUrl');
    }
  },
  saveReferrers(transition) {
    let authService = this.get('authService');
    if (transition.queryParams.prc) {
      authService.set('prc', transition.queryParams.prc);
    }

    if (transition.queryParams.rc) {
      authService.set('rc', transition.queryParams.rc);
    }
  },
  model(){
    return this.get('registry').loadDecision();
  },
  setupController(controller, model){
    this._super(controller, model);
    this.set('menu.appController', controller);
  },
});
