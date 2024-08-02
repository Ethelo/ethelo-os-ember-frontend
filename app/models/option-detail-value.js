import DS from 'ember-data';
export default DS.Model.extend({
  value: DS.attr('string'),
  optionDetail: DS.belongsTo('option-detail', {
    async: false
  }),
  option: DS.belongsTo('option', {
    async: false
  }),
  decision: DS.belongsTo('decision', {
    async: false
  }),
});


