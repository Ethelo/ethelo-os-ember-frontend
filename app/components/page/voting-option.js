import BasePage from 'frontend/mixins/base-page';
import ContentBlocks from 'frontend/mixins/content-blocks';
import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(BasePage, Registry, ContentBlocks, {
  option: Ember.computed.alias('page.dataSource'),
  sortedOptions: Ember.computed('option.id', function() {
    return [this.get('option')];
  }),
  criteria: Ember.computed(function() {
    return this.get('store').peekAll('criterion');
  }),
  filteredCriteria: Ember.computed('criteria.[]', 'page.excludedItems', function(){
    let excluded = this.get('page.excludedItems') || [];
    return this.get('criteria').filter(function(criterion) {
      return !excluded.contains(criterion.get('id').toString());
    });
  }),
  sortedCriteria: Ember.computed('filteredCriteria.[]', 'page.finalItemOrder.[]', function(){
    let criteria = this.get('filteredCriteria').toArray();

    this.get('page.finalItemOrder'); // observe
    return this.sortPageItems(criteria, this);

  }),
  titleDetails: [], // no details for criteria
  pageCommentScope: 'comments.options',
  pageCommentTarget: Ember.computed.alias('page.dataSource'),

  itemCommentSection: 'criterion',
  pageCommentSection: 'option',

});
