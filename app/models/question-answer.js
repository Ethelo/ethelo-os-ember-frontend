import DS from 'ember-data';

export default DS.Model.extend({
  caption: DS.attr('string'),
  value: DS.attr('string'),
  stringId: Ember.computed('id', function() {
    return String(this.get('id'));
  }),
  position: DS.attr('number'),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  question: DS.belongsTo('question', {
    async: false,
  }),
});


