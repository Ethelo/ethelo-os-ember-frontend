export default Ember.Route.extend({
  analytics: Ember.inject.service(),
  i18n: Ember.inject.service(),
  actions: {
    didTransition() {
      this.get('analytics').sendPageView('/lost-password', this.get('i18n').t("authentication.request_password.title").toString());
    }
  }
});
