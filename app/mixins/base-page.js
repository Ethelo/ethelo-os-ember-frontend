import Registry from 'frontend/mixins/registry';
import ContentBlocks from 'frontend/mixins/content-blocks';

export default Ember.Mixin.create(Registry, ContentBlocks, {
  menu: Ember.inject.service(),
  theme: Ember.computed.alias('registry.decision.theme'),
  cleanKeywords(keywords) {
    if(!Em.isArray(keywords)) {
      return [];
    }
    return keywords.filter(x => x).map(x => x.toLowerCase()).sort();
  },
  selectedKeywords: Ember.computed(
    'selectedFilters.filter1.[]',
    'selectedFilters.filter2.[]',
    'selectedFilters.filter3.[]',
    'selectedFilters.filter4.[]',
    function() {
      return [
        this.cleanKeywords(this.get('selectedFilters.filter1')),
        this.cleanKeywords(this.get('selectedFilters.filter2')),
        this.cleanKeywords(this.get('selectedFilters.filter3')),
        this.cleanKeywords(this.get('selectedFilters.filter4')),
      ];
    }),
  filterByKeyword(items) {
    let selected = this.get('selectedKeywords');
    return items.filter(function(item) {
      let itemKeywords = item.get('cleanKeywords');

      if(itemKeywords.get('length') < 1) {
        return false;
      }

      let include = selected
        .every(function(selectedList) {
          if(Em.isEmpty(selectedList)) {
            return true;
          }
          let hasAny = itemKeywords.any(function(keyword) {
            return selectedList.contains(keyword);
          });
          return hasAny;
        });
      return include;
    });
  },

  filterByOptionCategoryRangeVotes(optionCategories) {
    if(!this.get('theme.enableVotingFilter')) {
      return optionCategories;
    }

    const showVoted = this.get('selectedFilters.filter0') === 'voted';
    const showUnVoted = this.get('selectedFilters.filter0') === 'unvoted';

    if( !showUnVoted && !showVoted) {
      return optionCategories;
    }

    const votedList = this.get('currentUserVotedOptionCategories');

    return this.get('optionCategories').filter(function(optionCategory) {
      let isVoted = votedList.contains(optionCategory.get('id'));
      if(showVoted) {
        return isVoted;
      } else {
        return !isVoted;
      }
    });
  },
  translationScope: Ember.computed.alias('page.translationScope'),

  decision: Ember.computed.alias('page.decision'),

  showLoginPanel: Ember.computed('page.loginPanelEnabled', 'authService.notLoggedIn', function() {
    return this.get('authService.notLoggedIn') && this.get('page.loginPanelEnabled');
  }),
  showLoggedInPanel: Ember.computed('page.loginPanelEnabled', 'authService.notLoggedIn', function() {
    if(this.get('authService.notLoggedIn') || !this.get('page.loginPanelEnabled')) {
      return false;
    }

    let hasTitle = this.hasContentFor('authentication.login_panel.joined_title', null);
    let hasContent = this.hasContentFor('authentication.login_panel.joined_content_html', null);

    return hasTitle || hasContent;
  }),

  pageCommentSection: 'page',
  pageCommentScope: 'comments.pages',
  pageCommentTarget: Ember.computed.alias('page'),

  hasPageComments: Ember.computed('decision.commentsPermissions', function () {
    return 'decision.commentsPermissions' !== 'none';
  }),
  hasSidebarPageComments: Ember.computed('page.hasSidebarPageComments', 'hasPageComments', function () {
    return this.get('page.hasSidebarPageComments') && this.get('hasPageComments');
  }),
  hasCenterPageComments: Ember.computed('page.hasCenterPageComments', 'hasPageComments', function () {
    return this.get('page.hasCenterPageComments') && this.get('hasPageComments');
  }),
  itemCommentSection: null,

  hasitemListComments: Ember.computed('page.hasItemListComments', function () {
    return this.get('page.hasItemListComments');

  }),

  // Check that the sort order has unique sort order present.(example [1,2,3,4,5] and not [0,0,0,0,0])
  // lowest sort order first(ascending order)
  // If sort order is not available sort according to the title alphabetically
  sortBySortAndTitle(items){
    let sortOrder = items.map(x => x.get("sort")).sort();
    let isDuplicateSortOrder = sortOrder.some((val, i) => sortOrder.indexOf(val) !== i);
    if (sortOrder && sortOrder.length > 0 && !isDuplicateSortOrder) {
      return items.sort((a, b) => a.get('sort') - b.get('sort'));
    }
    return items.sort((a, b) => a.get("title").localeCompare(b.get("title")));
  },
  sortPageItems(items, page) {
    /* Sort the results based on the following conditions:
     **      1. Order by page order if set
     **      2. Use sort value
     **      3. Use alphabetic title
     */

    // Check if page has item order. If available, sort using that order.
    let pageItemOrder = page.get('finalItemOrder') || page.get('page.finalItemOrder');
    if (pageItemOrder && pageItemOrder.length > 0) {
      let orderIndex = function (item) {
        return pageItemOrder.indexOf(parseInt(item.get('id')));
      };

      return items.sort(function (a, b) {
        return orderIndex(a) > orderIndex(b) ? 1 : -1;
      });
    }

    return this.sortBySortAndTitle(items);
  },
  actions: {
    updateQuery(key, value) {
      this.sendAction('updateQuery', key, value);
      return true;
    },
  }
});
