import DS from 'ember-data';
export default DS.Model.extend({
  value: DS.attr('string'),
  updatedAt: DS.attr('date'),
  decisionUser: DS.belongsTo('decision-user', {
    async: false,
  }),
  question: DS.belongsTo('question', {
    async: false,
  }),
  answers: DS.hasMany('question-answer', {
    async: false,
  }),
  filename: DS.attr('string'),
  firstAnswer: Ember.computed.alias('answers.firstObject'),
  answerIds: Ember.computed('answers.[]', function(){
    let answers = this.get('answers');
    if( Em.isEmpty(answers) ){
      return [];
    }
    return answers.map(answer => {
      return answer.get('id');
    });
  }),
  firstAnswerId: Ember.computed.alias('answerIds.firstObject'),

});
