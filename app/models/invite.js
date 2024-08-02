import DS from 'ember-data';
export default DS.Model.extend({
  name: DS.attr('string'),
  valid: DS.attr('boolean'),
  allowNameChange: DS.attr('boolean'),
  allowEmailChange: DS.attr('boolean'),
  error: DS.attr('string'),
  decision: DS.belongsTo('decision', {
    async: false
  }),
 });
