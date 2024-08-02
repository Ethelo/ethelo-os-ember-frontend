import DS from 'ember-data';

export default DS.Model.extend({
  changedJsonData: DS.attr('string'),
  jsonData: DS.attr('string'),
  signature: DS.attr('string'),
  updatedAt: DS.attr('date'),
  decisionUser: DS.belongsTo('decision-user', {
    async: false,
  }),
  decision: DS.belongsTo('decision', {
    async: false,
  }),
});
