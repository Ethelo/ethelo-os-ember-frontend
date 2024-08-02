import BaseController from 'frontend/controllers/base';
import pageCompletion from 'frontend/mixins/page-completion';

export default BaseController.extend(pageCompletion, {
  showProgressBar: Ember.computed('percent', 'enableProgressBar', function(){
    return this.get('enableProgressBar') && this.get('percent') !== '';
  }),
  menu: Ember.inject.service(),
  page: Ember.computed.alias('model'),
  queryParams: [
    'rank', 'isCollapsed', 'anchor',
    'filter0', 'filter1', 'filter2', 'filter3', 'filter4', 'filter0',
  ],
  anchor: null,
  rank: null,
  filter0: null,
  filter1: [],
  filter2: [],
  filter3: [],
  filter4: [],
  selectedFilters: Ember.computed('filter0', 'filter1.[]', 'filter2.[]', 'filter3.[]', 'filter4.[]', function() {
    var selected = {
      filter0: this.get('filter0'),
      filter1: this.get('filter1').toArray(),
      filter2: this.get('filter2').toArray(),
      filter3: this.get('filter3').toArray(),
      filter4: this.get('filter4').toArray(),
    };
    return selected;
  }),
  currentPageIsBlocked: Ember.computed('menu.progressChanged', 'page.id', 'menu.balanceBlocksNavigation', function () {
    this.get('menu.progressChanged');
    this.get('menu.balanceBlocksNavigation');
    this.get('page.id'); //watch

    return this.get('menu').pageIsBlocked(this.get('page'));
  }),
  pageIndex: Ember.computed('rank', function () {
    let rank = this.get('rank');

    if (!Ember.isEmpty(rank) && rank > 0) {
      return rank;
    }

    return 1;
  }),
  pageComponent: Ember.computed('page.template', function () {
    return 'page/' + this.get('page.template').replace(/_/g, '-');
  }),
  currentURL: Ember.computed(function() {
    return window.location.pathname;
  }),
  scrollToAnchor() {
    const anchor = "#" + this.get('anchor');
    if(anchor) {
      const $elem = $(anchor);
      if($elem.length > 0) {
        window.scrollTo(0, $elem.offset().top - 120);
      }
    }
  },
  anchorChanged: function() {
    this.scrollToAnchor();
  }.observes('anchor'),
  updateMenuFilters: function() {
    this.get('menu').set('filter0', this.get('selectedFilters.filter0'));
    this.get('menu').set('filter1', this.get('selectedFilters.filter1'));
    this.get('menu').set('filter2', this.get('selectedFilters.filter2'));
    this.get('menu').set('filter3', this.get('selectedFilters.filter3'));
    this.get('menu').set('filter4', this.get('selectedFilters.filter4'));

  }.observes(
    'selectedFilters.filter0',
    'selectedFilters.filter1.[]',
    'selectedFilters.filter2.[]',
    'selectedFilters.filter3.[]',
    'selectedFilters.filter4.[]'
  ),

  actions: {
    updateQuery(key, value) {
      this.set(key, value);
    }
  },
});
