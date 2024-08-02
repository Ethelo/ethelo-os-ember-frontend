import BasePage from 'frontend/mixins/base-page';
import ContentBlocks from 'frontend/mixins/content-blocks';
import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(BasePage, Registry, ContentBlocks, {
  criterion: Ember.computed.alias('page.dataSource'),
  sortedCriteria: Ember.computed('criterion.id', function() {
    return [this.get('criterion')];
  }),
  options: Ember.computed(function() {
    return this.get('store').peekAll('option');
  }),
  filteredOptions: Ember.computed('options.[]', 'page.excludedItems', function(){
    let excluded = this.get('page.excludedItems') || [];
    return this.get('options').filter(function(option) {
      return !excluded.contains(option.get('id').toString());
    });
  }),
  sortedOptions: Ember.computed('filteredOptions.[]', 'page.finalItemOrder.[]', function(){
    let options = this.get('filteredOptions').toArray();

    this.get('page.finalItemOrder'); // observe
    return this.sortPageItems(options, this);

  }),
  titleDetails: Ember.computed('sortedOptions.firstObject.visibleDetailValues.[]', function() {
    return (this.get('sortedOptions.firstObject.visibleDetailValues') || []).slice(0, 2).mapBy('label');
  }),
  pageCommentScope: 'comments.criteria',
  pageCommentTarget: Ember.computed.alias('page.dataSource'),
  pageCommentSection: 'criterion',
  itemCommentSection: 'option',
});
