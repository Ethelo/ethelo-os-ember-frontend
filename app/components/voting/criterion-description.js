import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry,{
  showContent: Ember.computed.or('criterion.info'),
});