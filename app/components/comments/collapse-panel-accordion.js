import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  tagName: '',
  translationScope: Ember.computed.alias('page.translationScope'),

});
