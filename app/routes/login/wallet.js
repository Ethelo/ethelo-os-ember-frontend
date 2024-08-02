import Registry from 'frontend/mixins/registry';

export default Ember.Route.extend(Registry, {
  model() {
    return this.get('registry.decision');
  }
});
