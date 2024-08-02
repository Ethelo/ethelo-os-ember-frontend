import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry,{
  hideNext: Ember.computed.not('registry.decision.theme.enableBottomNext'),

});
