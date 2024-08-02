import DS from 'ember-data';
export default DS.Model.extend({
  weighting: DS.attr('number'),
  updatedAt: DS.attr('date'),
  decisionUser: DS.belongsTo('decision-user', {
    async: false,
  }),
  criterion: DS.belongsTo('criterion', {
    async: false,
  }),
});


