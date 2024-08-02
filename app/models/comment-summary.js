import DS from 'ember-data';
export default DS.Model.extend({

  decisionUser: DS.belongsTo('decision-user', {
    async: false
  }),

  comments: DS.attr('number'),
  commentReplies: DS.attr('number'),
  latestComment: DS.attr('date'),
  updatedAt: DS.attr('date'),
  target: DS.belongsTo('comment-target', {
    async: false, inverse: null, polymorphic: true
  }),
  target2: DS.belongsTo('comment-target', {
    async: false, inverse: null, polymorphic: true
  }),

});


