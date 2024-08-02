import BasePage from 'frontend/mixins/base-page';
import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(BasePage, Registry, {
  questions: Ember.computed.alias('page.dataSource.questions'),
  sortedQuestions: Ember.computed('questions.[]', 'page.finalItemOrder.[]', function() {
    let questions = this.get('questions').toArray();

    this.get('page.finalItemOrder'); // observe
    return this.sortPageItems(questions, this);

  }),

  goNextAfterChange: false,
  actions: {
    save(){
      console.log('save called in sp');
     // nothing
    }
  }
});
