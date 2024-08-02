import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  avatar: DS.attr('string'),
  email: DS.attr('string'),
  staff: DS.attr('boolean'),
  guest: DS.attr('boolean'),
  agreedToTerms:DS.attr('boolean'),
  decisionUser: DS.belongsTo('decision-user', {
    async: false
  }),
  web3Address: DS.attr('string'),
 });
