export default Ember.Route.extend({
  analytics: Ember.inject.service(),
  i18n: Ember.inject.service(),
  beforeModel(transition) {
    this.set('token', transition.queryParams.token);
  },
  model(params) {
    if (params.token) {
      this.set('token', params.token);
    }
    let token = this.get('token');
    if (!token) {
      this.transitionTo('login');
    }
    return this.get('decision');
  },
  actions: {
    didTransition() {
      this.get('analytics').sendPageView('/password-reset', this.get('i18n').t("authentication.reset_password.title").toString());
    }
  }
});
