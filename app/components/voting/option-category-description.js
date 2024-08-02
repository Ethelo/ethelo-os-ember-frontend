import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry,{
  showContent: Ember.computed('optionCategory.info', function(){
    return ! Ember.isEmpty( this.get('optionCategory.info'));
  }),
});