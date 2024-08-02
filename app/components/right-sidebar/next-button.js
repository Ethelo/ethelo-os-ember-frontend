import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry,{
  menu: Ember.inject.service(),

});
