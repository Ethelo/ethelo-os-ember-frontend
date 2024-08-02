import Registry from 'frontend/mixins/registry';

export default Ember.Route.extend(Registry,{
  authService: Em.inject.service('authentication'),
  model() {
    return this.get('registry.decision');
  },
  beforeModel(transition) {
   let from = transition.queryParams.from;
   if( Em.isPresent(from) && from === 'signOut' ){
     this.get('authService').ajaxSignOut();
   }
  },
});
