import BasePage from 'frontend/mixins/base-page';
import Registry from 'frontend/mixins/registry';
import InfluentTools from 'frontend/mixins/influent-tools';
import ResultBreakdown from 'frontend/mixins/result-breakdown';

export default Ember.Mixin.create(BasePage, Registry, InfluentTools, ResultBreakdown, {
  namespace: 'result-breakdown',
  menu: Ember.inject.service(),
  reverseSort: false,
  sortIcon: Ember.computed('reverseSort', function() {
    if(this.get('reverseSort')) {
      return '&#8593;';
    } else {
      return '&#8595;';// down  for biggest first
    }

  }),
  menuOrder: Ember.computed('menu.orderedPages', function() {
    let orderedPages = this.get('menu.orderedPages');
    let pageOrder = [];
    let component = this;
    orderedPages.forEach(function(page) {
      let dataSource = page.get('dataSource');
      if(Em.isEmpty(dataSource)) {
        if(page.get('template') === 'slider_option_category') {
          let items = component.sortPageItems(component.sliderOptionCategoryItems(page), page);
          items.forEach(function(item) {
            pageOrder.push(item.toString());
          });
        }
        return;
      }
      pageOrder.push(dataSource.toString());

    });
    return pageOrder;
  }),
  _sortResults(filterFunction, stat, isOptionCategorySort, includeGlobal = false) {
    const sortMethod = isOptionCategorySort ? this.get('optionCategorySortMethod') : this.get('optionsSortMethod');
    const results = includeGlobal ? this.get('combinedScenarioResults') : this.get('scenarioResults');
    let sorted;

    if(Ember.isEmpty(results)) {
      return [];
    } else {
      sorted = results
        .filter(filterFunction)
        .sortBy(stat).reverse();
    }

    if(sortMethod === 'display') {
      if(!Ember.isEmpty(this.get('decisionHasSliderVoting')) && this.get('decisionHasSliderVoting')) {
        sorted = !isOptionCategorySort ? this._sortOptionsByDisplay(sorted) : this._sortByDisplay(sorted, isOptionCategorySort);
      } else {
        sorted = this._sortByDisplay(sorted, isOptionCategorySort);
      }
    }
    if(sortMethod === 'sort') {
      sorted = this._sortBySortField(sorted);
    }
    // Randomize the sort result if Page has randomizeItems turned on.
    if(sortMethod !== 'support' && this.get('page.randomizeItems')) {
      sorted = this._randomizeSort(sorted);
    }

    if(this.get('reverseSort')) {
      sorted = sorted.reverse();
    }

    return sorted;
  },
  _randomizeSort(items) {
    let finalItemOrder = this.get("page.finalItemOrder");
    let randomlySorted = items.sort((a, b) => finalItemOrder.indexOf(parseInt(a.get("option.id"))) - finalItemOrder.indexOf(parseInt(b.get("option.id"))));
    return randomlySorted;
  },
  _sortByDisplay(items, isOptionCategorySort) {

    let order = isOptionCategorySort ? this.get('menuOrderOptionCategory') : this.get('menuOrder');
    let orderIndex = function(item) {
      let menuSortString = item.get('menuSortString');

      if(Em.isEmpty(menuSortString)) {
        return 1000; // arbitrarily large number to indicate 'end of list'
      }
      return order.indexOf(menuSortString);
    };

    let sorted = items.sort(function(a, b) {
      let aIndex = orderIndex(a);
      let bIndex = orderIndex(b);
      aIndex = Em.isEmpty(aIndex) ? 1000 : aIndex;
      bIndex = Em.isEmpty(bIndex) ? 1000 : bIndex;
      if(aIndex === bIndex) {
        return 0;
      }
      return aIndex > bIndex ? 1 : -1;
    });
    return sorted;
  },
  _sortBySortField(items) {
    return items.sort(function(a, b) {
      let aIndex = a.get('sortFieldString');
      let bIndex = b.get('sortFieldString');
      if(aIndex === bIndex) {
        return 0;
      }
      return aIndex > bIndex ? 1 : -1;
    });
  },
  _addMenuPages(results) {
    // Get menu page list and find the page and add it to the result model
    const orderedPages = this.get('menu.orderedPages');
    results.forEach(result => {
      let foundMenuPage;

      if(Em.isEmpty(result.get('optionCategory.id'))) {
        foundMenuPage = orderedPages.find(page => page.get('dataSource.id') === result.get('option.id'));
      }
      let optionCategoryId = result.get('optionCategory.id') || result.get('option.optionCategory.id');

      if(!foundMenuPage) {
        foundMenuPage = orderedPages.find(page => page.get('dataSource.id') === optionCategoryId);
      }
      if(!foundMenuPage) {
        /**
         * if current option category is slider_option_category look for itemOrder,
         * find the parent page
         *  */
        foundMenuPage = orderedPages.find(page =>
          page.get('template') === 'slider_option_category' && page.get('includedItems').includes(optionCategoryId)
        );
      }

      result.set("linkedMenuPage", foundMenuPage);
    });
  },
  optionCategoryBreakdown: Ember.computed('scenarioResults.@each.updatedAt', 'primaryStat', 'reverseSort', function() {
    this.get('scenarioResults'); // observe
    this.get('primaryStat');
    this.get('reverseSort');
    let that = this;
    let sortedResults = this._sortResults(function(result) {
      if(!result.get('isOptionCategoryResult')) {
        return false;
      }
      let optionCategory = result.get('optionCategory');
      // filter out the autobalance options and optionCategory
      return that.optionCategoryOptions(optionCategory).length > 0 && optionCategory.get('options.length') > 0;
    }, this.get('primaryStat'), true, true);
    this._addMenuPages(sortedResults);

    return sortedResults;
  }),
  optionParentCount: Ember.computed('statsDisplay.showOptionCategoryTitles', function() {
    return this.get('statsDisplay.showOptionCategoryTitles') ? 1 : 0;
  }),

  allOptionBreakdown: Ember.computed('scenarioResults.@each.updatedAt', function() {
    this.get('scenarioResults'); // observe
    return this._sortResults(function(result) {
      return result.get('isOptionResult');
    }, this.get('primaryStat'), false, false);
  }),
  optionBreakdown: Ember.computed('scenarioResults.@each.updatedAt', function() {
    this.get('scenarioResults'); // observe
    let optionCategoryId = this.get('optionCategory.id');

    let sortedResults = this._sortResults(function(result) {
      return result.get('isOptionResult') && result.get('option.optionCategory.id') === optionCategoryId;
    }, this.get('primaryStat'), false, false);
    this._addMenuPages(sortedResults);
    return sortedResults;
  }),

  criterionParentCount: Ember.computed('parentCount', 'statsDisplay.showOptionStats', function() {
    return this.get('parentCount') + (this.get('statsDisplay.showOptionStats') ? 1 : 0);
  }),
  displayCriteria: Ember.computed('criteriaEnabled', 'criterionBreakdown.length', function() {
    return this.get('criteriaEnabled') && this.get('criterionBreakdown.length') > 0;
  }),
  criteriaEnabled: Ember.computed(
    'statsDisplay.showCriterionStats', 'statsDisplay.showOptionCriteriaStats', 'hasCriteriaSubsection', 'registry.decision.criteria.length',
    function() {
      return this.get('hasCriteriaSubsection') &&
        (this.get('statsDisplay.showCriterionStats') || this.get('statsDisplay.showOptionCriteriaStats')) &&
        this.get('registry.decision.criteria.length') > 1;
    }),
  criterionBreakdown: Ember.computed.alias('resultsForCriterion'),
  resultsForCriterion: Ember.computed('scenarioResults.@each.updatedAt', function() {
    let optionId = this.get('option.id');
    this.get('scenarioResults'); // observe
    let filter = function(result) {
      return result.get('isCriterionResult') && result.get('option.id') === optionId;
    };
    return this._sortResults(filter, this.get('primaryStat'), true, false);
  }),
  userCriterionBreakdown: Ember.computed('resultsForCriterion', 'currentUserBinVotes', function() {
    let resultList = this.get('resultsForCriterion');
    let voteList = this.get('currentUserBinVotes');

    let visibleList = resultList.filter(function(result) {
      return voteList.find(function(binVote) {
        return binVote.get('option.id') === result.get('option.id') &&
          binVote.get('criterion.id') === result.get('criterion.id');
      });
    });

    return visibleList;
  }),

  primaryStat: Ember.computed('statsDisplay.primaryStat', function() {
    return this.get('statsDisplay.primaryStat') || 'ethelo';
  }),
  decisionHasSliderVoting: Ember.computed('menu.orderedPages', function() {
    let orderedPages = this.get('menu.orderedPages');
    let hasSliderVoting = false;
    orderedPages.forEach(function(page) {
      let dataSource = page.get('dataSource');
      if(Em.isEmpty(dataSource)) {
        if(page.get('template') === 'slider_option_category') {
          hasSliderVoting = true;
          return;
        }
      }
    });
    return hasSliderVoting;
  }),
  optionCategorySortMethod: Ember.computed('statsDisplay.optionCategorySortMethod', 'statsDisplay.resultSort', function() {
    return this.get('statsDisplay.optionCategorySortMethod') || this.get('statsDisplay.resultSort');
  }),
  optionsSortMethod: Ember.computed('statsDisplay.optionSortMethod', 'statsDisplay.resultSort', function() {
    return this.get('statsDisplay.optionSortMethod') || this.get('statsDisplay.resultSort');
  }),

  summaryOptionResults: Ember.computed('statsDisplay.showOptionCategories', 'scenarioResults.@each.updatedAt', function() {
    this.get('scenarioResults'); // observe

    // if optionCategories are turned off show all options and sort.
    if(!this.get('statsDisplay.showOptionCategories')) {
      return this._sortResults(function(result) {
        return result.get('isOptionResult');
      }, this.get('primaryStat'), false, true);
    }

    let optionCategoryId = this.get('optionCategory.id');
    let sortedOptions = this._sortResults(function(result) {
      return result.get('isOptionResult') && result.get('option.optionCategory.id') === optionCategoryId;
    }, this.get('primaryStat'), false, true);
    return sortedOptions;
  }),

  menuOrderOptionCategory: Ember.computed('menu.orderedPages', function() {
    let orderedPages = this.get('menu.orderedPages');
    let pageOrder = [];
    let component = this;
    orderedPages.forEach(function(page) {
      let dataSource = page.get('dataSource');
      if(Em.isEmpty(dataSource)) {
        if(page.get('template') === 'slider_option_category') {
          let items = component.sortPageItems(component.sliderOptionCategoryItems(page), page);
          items.forEach(function(item) {
            pageOrder.push(item.toString());
          });
        }
        return;
      }
      if(dataSource && dataSource.get("optionCategory") && pageOrder.indexOf(dataSource.get("optionCategory").toString()) === -1) {
        pageOrder.push(dataSource.get("optionCategory").toString());
        return;
      }
      pageOrder.push(dataSource.toString());
    });
    return pageOrder;
  }),

  optionsMenuOrder(optionCategoryID) {
    let orderedPages = this.get('menu.orderedPages') || [];
    let pageOrder = [],
      component = this;
    if(optionCategoryID) {
      // get order from optionCategory.
      orderedPages = orderedPages.filter(x => !Ember.isEmpty(x.get('dataSource'))).find(x => x.get('dataSource.id') === optionCategoryID);
      if(!Ember.isEmpty(orderedPages)) {
        return orderedPages.get('finalItemOrder');
      }
      return [];
    }

    // get order of all options when no category is present.
    orderedPages.forEach(x => {
      if(Ember.isEmpty(x.get('dataSource')) && x.get('template') === 'slider_option_category') {
        var items = component.sortPageItems(component.sliderOptionCategoryItems(x), x);
        if(items && items.length > 0) {
          items.forEach(function(item) {
            pageOrder.push(parseInt(item.get('id')));
          });
        }
        return;
      }
      if(!Ember.isEmpty(x.get('dataSource')) && !Ember.isEmpty(x.get('finalItemOrder'))) {
        pageOrder = pageOrder.concat(x.get('finalItemOrder'));
      }
    });
    return pageOrder;
  },

  _sortOptionsByDisplay(items) {
    const optionCategoryId = this.get('optionCategory.id');
    const order = this.optionsMenuOrder(optionCategoryId);
    const orderIndex = function(item) {
      const foundIndex = order.indexOf(parseInt(item.get('option.optionCategory.id')));
      if(foundIndex && foundIndex !== -1 && order.indexOf(parseInt(item.get('option.id'))) === -1) {
        return foundIndex;
      }
      return order.indexOf(parseInt(item.get('option.id')));
    };

    return items.sort(function(a, b) {
      return orderIndex(a) > orderIndex(b) ? 1 : -1;
    });
  },
  // copied from balance tools and page completion, fix later
  // auto balance overrides withUser right now so can't be used directly
  autoBalanceOption: Ember.computed('allOptions.[]', 'balanceSettings.auto-balance-option-slug', function() {
    const slug = this.get('balanceSettings.auto-balance-option-slug');
    return this.get('allOptions').find(function(option) {
      return option.get('slug') === slug;
    });
  }),
  optionCategoryOptions(optionCategory) {
    const autoBalanceOption = this.autoBalanceOption;
    const that = this;
    if(!autoBalanceOption) {
      return optionCategory.get('options');
    }
    return optionCategory.get('options')
      .filter(function(option) {
        return !that.isAutoBalanceOption(option);
      });
  },
  isAutoBalanceOption(option) {
    return option.get('slug') === this.get('balanceSettings.auto-balance-option-slug');
  },
  allOptionCategories: Ember.computed(function() {
    return this.get('store').peekAll('option-category');
  }),
  sliderOptionCategoryItems: function (page) {
    const included = page.get('includedItems');
    const that = this;

    return this.get('allOptionCategories')
      .filter(function (optionCategory) {
        return that.optionCategoryOptions(optionCategory).length > 0 &&
          included.contains(optionCategory.get('id').toString());
      });

  },

});
