import DS from 'ember-data';
export default DS.Model.extend({
  value: DS.attr('number'),
  updatedAt: DS.attr('date'),
  caption: DS.attr('string'),
  question: DS.belongsTo('question', {
    async: false,
  }),
  sort: DS.attr('string'),
  answer: DS.belongsTo('question-answer', {
    async: false, inverse: null,
  }),
  decision: DS.belongsTo('decision', {
    async: false
  }),
  hasAnswer: Ember.computed('caption', 'answer', function(){
    return !Em.isEmpty(this.get('caption')) || !Em.isEmpty(this.get('answer'));
  }),
  answerTitle: Ember.computed('caption', 'answer.title', function(){
    return this.get('answer.title') || this.get('caption');
  }),
});
