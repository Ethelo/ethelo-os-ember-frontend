import DS from 'ember-data';
export default DS.Model.extend({
  deleteVote: DS.attr('boolean', {defaultValue: false}),
  updatedAt: DS.attr('date'),
  decisionUser: DS.belongsTo('decision-user', {
    async: false,
  }),
  optionCategory: DS.belongsTo('option-category', {
    async: false,
  }),
  lowOption: DS.belongsTo('option', {
    async: false,
  }),
  highOption: DS.belongsTo('option', {
    async: false,
  }),
});


