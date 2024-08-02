// this basically lets us sideload the decision info we need to display after user is logged in
import DS from 'ember-data';

export default DS.Model.extend({
  rendered: DS.attr('date'),

  decisionUser: DS.belongsTo('decision-user', {
    async: false
  }),
});
