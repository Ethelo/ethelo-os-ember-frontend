import DS from 'ember-data';
export default DS.Model.extend({
  bin: DS.attr('number'),
  deleteVote: DS.attr('boolean', {defaultValue: false}),
  invalidVote: Ember.computed('deleteVote', 'bin', function(){
    return this.get('deleteVote') || this.get('bin') === 0;
  }),
  updatedAt: DS.attr('date'),
  decisionUser: DS.belongsTo('decision-user', {
    async: false,
  }),
  criterion: DS.belongsTo('criterion', {
    async: false,
  }),
  option: DS.belongsTo('option', {
    async: false,
  }),
});
