import BasePage from 'frontend/mixins/base-page';
import ContentBlocks from 'frontend/mixins/content-blocks';
import Registry from 'frontend/mixins/registry';
import OptionCategoryRangeVoteInfluent from 'frontend/mixins/option-category-range-vote-influent';

export default Ember.Component.extend(BasePage, Registry, ContentBlocks, OptionCategoryRangeVoteInfluent, {
  allOptionCategories: Ember.computed(function() {
    return this.get('store').peekAll('option-category');
  }),
  optionCategories: Ember.computed('allOptionCategories.[]', 'page.includedItems.[]', function() {
    let included = this.get('page.includedItems');
    return this.get('allOptionCategories').filter(function(optionCategory) {
      return optionCategory.get('options.length') > 0 &&
        included.contains(optionCategory.get('id').toString());
    });
  }),

  filterString: Ember.computed(
    'theme.enableFilters',
    'selectedFilters.filter0',
    'selectedFilters.filter1.[]',
    'selectedFilters.filter2.[]',
    'selectedFilters.filter3.[]',
    'selectedFilters.filter4.[]',
    function() {
      if(this.get('theme.enableFilters') !== true) {
        return '';
      }
      const stringa = [
        this.get('selectedFilters.filter0'),
        this.get('selectedFilters.filter1').toArray(),
        this.get('selectedFilters.filter2').toArray(),
        this.get('selectedFilters.filter3').toArray(),
        this.get('selectedFilters.filter4').toArray()
      ].flat();

      return stringa.join(',');
    }),
  filteredOptionCategories: Ember.computed(
    'theme.enableFilters', 'optionCategories.[]', 'filterString', 'currentUserVotedOptionCategories.[]',
    function() {
      if(!this.get('theme.enableFilters')) {
        return this.get('optionCategories');
      }
      this.get('filterString'); // observe
      this.get('currentUserVotedOptionCategories');
      const filteredByKeyword = this.filterByKeyword(this.get('optionCategories'));
      return this.filterByOptionCategoryRangeVotes(filteredByKeyword);
    }),

  sortedOptionCategories: Ember.computed('filteredOptionCategories.[]', 'page.finalItemOrder.[]', function() {
    let optionCategories = this.get('filteredOptionCategories').toArray();
    let order = this.get('page.finalItemOrder');

    let orderIndex = function(item) {
      return order.indexOf(parseInt(item.get('id')));
    };

    return optionCategories.sort(function(a, b) {
      return orderIndex(a) > orderIndex(b) ? 1 : -1;
    });
  }),
  beginCollapsed: Ember.computed(
    'sortedOptionCategories.length',
    'page.settings.collapse-options',
    function() {
      // reusing an existing setting, so name is weird
      if( this.get('page.settings.collapse-options' ) === false ) {
        return false;
      } else {
        return this.get('sortedOptionCategories.length') > 9;
      }
  }),
  pageCommentScope: 'comments.pages',
  pageCommentTarget: Ember.computed.alias('page'),

  pageCommentSection: 'page',
  itemCommentSection: 'option_category',

});
