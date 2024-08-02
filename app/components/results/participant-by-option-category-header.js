export default Ember.Component.extend({

  percentWidth: Ember.computed('showPiecharts', function() {
    if (this.get('showPiecharts')) {
      return new Ember.Handlebars.SafeString('');
    } else {
      return new Ember.Handlebars.SafeString('width: 100%');
    }
  })
});
