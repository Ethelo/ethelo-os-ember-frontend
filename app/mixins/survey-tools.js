import Registry from 'frontend/mixins/registry';
export default Ember.Mixin.create(Registry, {
  allSurveyResponses: Ember.computed(function() {
    return this.get('store').peekAll('survey-response');
  }),
  allQuestions: Ember.computed(function() {
    return this.get('store').peekAll('question');
  }),
  currentUserSurveyResponses: Ember.computed('allSurveyResponses.@each.question', 'allSurveyResponses.@each.updatedAt', 'registry.decisionUser.id', function() {
    let decisionUserId = this.get('registry.decisionUser.id');
    return this.get('allSurveyResponses').filter(function(surveyResponse) {
      //observing in case it makes a difference for observers
      surveyResponse.get('question');
      surveyResponse.get('updatedAt');
      return surveyResponse.get('decisionUser.id') === decisionUserId;
    });
  }),
  currentUserAnsweredQuestions: Ember.computed('currentUserSurveyResponses.@each.question', 'currentUserSurveyResponses.@each.updatedAt', function() {
    return this.get('currentUserSurveyResponses').map(function(surveyResponse) {
      return surveyResponse.get('question.id');
    });
  }),
  questionMatchingSlug: function(slug) {
    return this.get('allQuestions').find(function(question) {
      return question.get('slug') === slug;
    });
  },
});
