import DS from 'ember-data';
export default DS.Model.extend({
  // nav settings
  decisionUser: DS.belongsTo('decision-user', {
    async: false
  }),
  target: DS.belongsTo('comment-target', {
    async: false, inverse: null, polymorphic: true
  }),

  baseId: Ember.computed('target.id', 'target.commentType', function(){
    return "comment-" +
      this.get('target.commentType') + this.get('target.id');
  }),
  clientCommentId: Ember.computed('baseId', 'id', function(){
    return this.get('baseId') + '-' + this.get('id');
  }),
  createdAt: DS.attr('date'),
  title: DS.attr('string'),
  content: DS.attr('string'),
  status: DS.attr('string'),

});
