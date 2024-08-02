import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  actions: {
    optionDetailValuesRadios: function (value) {
      this.sendAction("selectedDetailIdChange", value);
    },
  }
});
