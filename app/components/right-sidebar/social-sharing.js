import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  decision: Ember.computed.alias('page.decision'),
  iconColor: Ember.computed('registry.decision.theme.primaryColor', function () {
    return this.get('registry.decision.theme.primaryColor');
  }),
});
