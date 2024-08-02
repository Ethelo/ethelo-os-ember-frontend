import DS from 'ember-data';
export default DS.Model.extend({
  decisionUser: DS.belongsTo('decision-user', {
    async: false
  }),
  comment: DS.belongsTo('comment', {
    async: false, inverse: null
  }),
  kind: DS.attr('string'),
  value: DS.attr('boolean', {defaultValue: false}),
  updatedAt: DS.attr('date')
});


