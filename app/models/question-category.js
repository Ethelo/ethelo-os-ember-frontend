import CommentTarget from 'frontend/mixins/comment-target';
import DS from 'ember-data';

export default DS.Model.extend(CommentTarget, {
  title: DS.attr('string'),
  slug: DS.attr('string'),
  info: DS.attr('string'),
  sort: DS.attr('number', {defaultValue: 0}),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  questions: DS.hasMany('question', {
    async: false
  }),
  questionsIds: Ember.computed.mapBy('questions', 'id'),
  commentType: 'QuestionCategory',

});


