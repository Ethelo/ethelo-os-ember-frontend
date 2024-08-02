import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {

  actions: {
    updateFilter(key, value) {
      this.sendAction('updateFilter', key, value);
      return true;
    },
  }
});
