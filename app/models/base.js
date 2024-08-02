// this basically lets us sideload the decision info we need to display before user is logged in
import DS from 'ember-data';

export default DS.Model.extend({
  rendered: DS.attr('date'),
  decision: DS.belongsTo('decision', {
    async: false
  }),
});
