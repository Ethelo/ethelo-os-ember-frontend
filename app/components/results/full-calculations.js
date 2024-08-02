import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {

  hasData: Ember.computed('calculationsData.@each.value', function() {
    this.get('calculationsData'); // observe
    let data = this.get('calculationsData')
      .filter(function(c) {
        return c.visible;
      });
    return data.length > 0;
  })
});
