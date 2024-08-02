export default Ember.Mixin.create({
  i18n: Ember.inject.service(),
  menu: Ember.inject.service(),
  registry: Ember.inject.service(),
  session: Ember.computed.alias('registry.session'),
  store: Ember.inject.service(),
  authService: Ember.inject.service('authentication'),
  user: Ember.computed.alias('registry.user'),
  decision: Ember.computed.alias('registry.decision'),

});
