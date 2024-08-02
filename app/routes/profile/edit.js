import Registry from 'frontend/mixins/registry';

export default Ember.Route.extend(Registry,{
  model() {
    return this.get('registry.user');
  },
  afterModel: function(model, transition) {
    //jshint unused:false
    if (Ember.isNone(model) || model.get('guest')) {
      this.transitionTo('login');
    }
  },
});