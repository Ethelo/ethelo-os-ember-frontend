import SurveyPage from 'frontend/components/page/survey-page';

export default SurveyPage.extend({
  allQuestions: Ember.computed(function() {
    return this.get('store').peekAll('question');
  }),
  pledgeQuestion: Ember.computed('allQuestions.[]', 'page.settings.pledge-question-slug', function() {
    let slug = this.get('page.settings.pledge-question-slug');
    return this.get('allQuestions').find(function(question) {
      return question.get('slug') === slug;
    });
  }),
  questions: Ember.computed('pledgeQuestion', function(){
    if(Em.isEmpty(this.get('pledgeQuestion'))){
      return [];
    } else {
      return [this.get('pledgeQuestion')];
    }
  }),
  sortedQuestions: Ember.computed.alias('questions'),
});
