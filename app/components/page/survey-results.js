import BasePage from 'frontend/mixins/base-page';
import ContentBlocks from 'frontend/mixins/content-blocks';
import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(BasePage, Registry, ContentBlocks, {
  willInsertElement() {
    this._super(...arguments);
    this.updateSurveyTotals();
  },
  items: Ember.computed(function() {
    return this.get('store').peekAll('question-total');
  }),

  isLoading: Ember.computed('loader', 'loader.isPending', 'items.[]', function() {
    let loader = this.get('loader');
    let items = this.get('items');
    if (Em.isEmpty(items)) {
      return Em.isEmpty(loader) || loader.get('isPending');
    } else {
      return false;
    }
  }),
  updateSurveyTotals(){
    let loader = this.get('store').findAll('question-total');
    this.set('loader', loader);
  },
  questions: Ember.computed.alias('page.dataSource.questions'),
  sortedQuestions: Ember.computed('questions.@each.hasResponses', 'page.finalItemOrder.[]', function() {
    let questions = this.get('questions').toArray();
    this.get('page.finalItemOrder'); // observe
    let filtered =  questions
      .filter(function(question) {
        return question.get('hasTotals') && question.get('hasResponses');
      });

      return this.sortPageItems(filtered, this);

  }),
});
