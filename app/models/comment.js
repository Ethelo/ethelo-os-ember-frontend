import DS from 'ember-data';
export default DS.Model.extend({
  // nav settings
  parent: DS.belongsTo('comment', {
    async: false, inverse: 'replies'
  }),
  replies: DS.hasMany('comment', {
    async: false, inverse: 'parent'
  }),
  decisionUser: DS.belongsTo('decision-user', {
    async: false
  }),
  target: DS.belongsTo('comment-target', {
    async: false, inverse: null, polymorphic: true
  }),
  target2: DS.belongsTo('comment-target', {
    async: false, inverse: null, polymorphic: true
  }),

  baseId: Ember.computed('target.id', 'target.commentType','target2.id', 'target2.commentType', function(){
    return "comment-" +
      this.get('target.commentType') + this.get('target.id') + '-' +
      this.get('target2.commentType') + this.get('target2.id');
  }),
  commentId: Ember.computed('baseId', 'id', function(){
    return this.get('baseId') + '-' + this.get('id');
  }),
  createdAt: DS.attr('date'),
  title: DS.attr('string'),
  content: DS.attr('string'),
  likeCount: DS.attr('number'),
  dislikeCount: DS.attr('number'),
  flagCount: DS.attr('number'),
  privacy: DS.attr('string'),

});
