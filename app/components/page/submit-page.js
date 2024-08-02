import SurveyPage from 'frontend/components/page/survey-page';

export default SurveyPage.extend({
  allQuestions: Ember.computed(function() {
    return this.get('store').peekAll('question');
  }),
  submitQuestion: Ember.computed('allQuestions.[]', 'page.settings.submit-question-slug', function() {
    let slug = this.get('page.settings.submit-question-slug');
    return this.get('allQuestions').find(function(question) {
      return question.get('slug') === slug;
    });
  }),
  submitQuestionCaption: Ember.computed('submitQuestion', function() {
    const question = this.get('submitQuestion');
    return question.get('sortedAnswers.firstObject.caption');
   }),
  showPersonalResultsPanel: Ember.computed.bool('page.settings.personal-results-enabled'),
  showWeb3SubmitButton: Ember.computed.bool('registry.decision.web3SignatureRequired'),
  goNextAfterChange: true,
  incompletePagesList: Ember.computed('menu.getAllIncompletePages',function() {
    let page = this.get('page');
    const list = this.get('menu.getAllIncompletePages')
      .filter(function(item){ return item !== page;}); // remove submit page to prevent un-completable decision
    return list;
  }),
  showInCompletePagesPanel: Ember.computed('page.showIncompletePagesSection', 'incompletePagesList', function() {
    const incompletePageList = this.get('incompletePagesList') || [];
    const showIncompletePagesSection = this.get('page.showIncompletePagesSection');
    return showIncompletePagesSection && incompletePageList.length > 0;
  }),

  showSubmitButtonPanel: Ember.computed('incompletePagesList', 'page.showIncompletePagesSection','page.hideSubmitButtonWhenPagesIncomplete', 'menu.nextPageDisabled', function() {
    const incompletePageList = this.get('incompletePagesList') || [];
    const nextPageIsBlocked = this.get('menu.nextPageDisabled');
    const showIncompletePagesSection = this.get('page.showIncompletePagesSection');
    const hideSubmitButtonWhenPagesIncomplete = this.get('page.hideSubmitButtonWhenPagesIncomplete');

    /**
     * Panel is not enabled: Never show panel, always show submit
     * hideSubmitButtonWhenPagesIncomplete doesn't matter as it always requires
     * showIncompletePagesSection turned on
     */
    if(!showIncompletePagesSection){
      return true;
    }

    /**
     * Panel is enabled and next button is not disabled: Show panel if there are incomplete items, show submit button
     */
    if(showIncompletePagesSection && !nextPageIsBlocked){
      return true;
    }

    /** If both options are enabled and incompleteList > 0 then only hide it
     * This will change when there are no incomplete pages left and we need to
     * show submit page again
     */
    if(showIncompletePagesSection && hideSubmitButtonWhenPagesIncomplete && incompletePageList.length > 0){
      return false;
    }

    return true;
  }),
  questions: Ember.computed('submitQuestion', function(){
    if(Em.isEmpty(this.get('submitQuestion'))){
      return [];
    } else {
      return [this.get('submitQuestion')];
    }
  }),
  sortedQuestions: Ember.computed.alias('questions'),
});
