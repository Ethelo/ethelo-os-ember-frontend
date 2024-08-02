import Registry from 'frontend/mixins/registry';

export default Ember.Controller.extend(Registry, {
  pageLinks: Ember.computed.filterBy('registry.decisionUser.editLinks', 'type', 'page'),
});
