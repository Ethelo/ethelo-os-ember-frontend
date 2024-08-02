import Registry from 'frontend/mixins/registry';
import PageCompletion from 'frontend/mixins/page-completion';
import BalanceTools from 'frontend/mixins/balance-tools';
import Shuffle from 'frontend/utils/shuffle';

export default Ember.Service.extend(Registry, PageCompletion, BalanceTools, {
  isServiceFactory: true, // should not be needed?
  routing: Ember.inject.service(),
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  analytics: Ember.inject.service(),
  filter0: null,
  filter1: [],
  filter2: [],
  filter3: [],
  filter4: [],
  clientCommentService: Ember.inject.service('client-comments'),
  namespace: '', // mobile vs regular
  isDrawerOpen: false,
  activeSidebarView: null, // visible view in mobile layout

  toggleDrawer(mode) {
    let showDrawer;

    if(mode === 'show') {
      showDrawer = true;
      this.set('isDrawerOpen', true);
    } else if(mode === 'hide') {
      showDrawer = false;
      this.set('isDrawerOpen', false);
    } else {
      showDrawer = this.toggleProperty('isDrawerOpen');
    }

    this.set('activeSidebarView', null);

    Ember.run.scheduleOnce('afterRender', this, function() {
      let $underlay = $('.side-drawer-underlay');

      if(showDrawer) {
        $('.side-drawer').animate({'margin-left': 0}, 500);
        $underlay
          .css('visibility', 'visible')
          .animate({opacity: '0.5'}, 500);
        $('.progress-bar-voting').animate({opacity: '0'}, 500);
      } else {
        $('.side-drawer').animate({'margin-left': '-1000px'}, 500);
        $underlay.animate({opacity: '0'}, 500, () => $underlay.css('visibility', 'hidden'));
        $('.progress-bar-voting').animate({opacity: '1'}, 500);
      }
    });
  },
  currentPage: null,
  appController: null, // can't inject this, so we set it in application route
  currentRouteName: Ember.computed.alias('appController.currentRouteName'),
  currentPath: Ember.computed.alias('appController.currentPath'),
  allPages: Ember.computed(function() {
    return this.get('store').peekAll('page');
  }),
  menuRootPage: Ember.computed('allPages.@each.url', 'registry.decisionUser.user', function() {
    this.get('registry.decisionUser.user'); //observe to update menu tree

    let allPages = this.get('allPages');
    if(allPages) {
      return allPages.findBy('rootState', 'root_for_menu');
    } else {
      return null;
    }
  }),

  pagesByParent: Ember.computed('allPages.@each.url', 'registry.decisionUser.user', function() {
    this.get('registry.decisionUser.user'); //observe to update menu tree
    let pagesByParent = {};
    let pages = this.get('allPages');

    pages.forEach(function(page) {
      let parentId = page.get('parent.id');

      if(!parentId) {
        parentId = 'root';
      }

      if(!pagesByParent[parentId]) {
        pagesByParent[parentId] = [];
      }
      pagesByParent[parentId].push(page);
    });

    return pagesByParent;
  }),
  pageTree: Ember.computed('pagesByParent', 'menuRootPage', function() {
    let pagesByParent = this.get('pagesByParent');
    let page = this.get('menuRootPage');
    if(!page) {
      return {};
    }
    let root = this.newLeaf(null);
    root.buildTime = Date.now(); // we'll observe this
    let tree = this.buildTree(pagesByParent[page.id], root);
    return tree;
  }),

  getAllIncompletePages: Ember.computed('pageTree', 'progressChanged', function() {
    this.get('progressChanged'); //observe
    const pageTree = this.get('pageTree');
    const currentContext = this;
    if(!Ember.isEmpty(pageTree)) {
      let incompletePages = [];
      pageTree.childItems.forEach(x => {
        const progress = currentContext.progressStateFor(x.page, 'progress');
        if(x.childItems && x.childItems.length > 0) {
          const incompleteChildPages = x.childItems.filter(y => {
            const childPageProgress = currentContext.progressStateFor(y.page, 'progress');
            return childPageProgress === "none" || childPageProgress === "partial";
          });
          if(incompleteChildPages && incompleteChildPages.length > 0) {
            incompletePages.push({page: x.page, childItems: incompleteChildPages});
          }
        } else {
          if(progress === "none" || progress === "partial") {
            incompletePages.push(x);
          }
        }
      });
      return incompletePages;
    }
    return [];
  }),
  newLeaf(page) {
    return {page: page, childItems: []};
  },

  buildTree(pages, tree) {
    let addToTree = this.addToTree.bind(this);
    if(pages) {
      let orderedPages = pages.sortBy('position');
      orderedPages.forEach(function(page) {
        addToTree(page, tree);
      });
    }
    return tree;
  },

  addToTree(page, tree) {
    if(page.get('hasChildren')) {
      let pagesByParent = this.get('pagesByParent');
      let pageId = page.get('id');
      let parentLeaf = this.newLeaf(page);
      if(pagesByParent[pageId]) {
        parentLeaf = this.buildTree(pagesByParent[pageId], parentLeaf);
      }

      if(page.get('randomizeNestedPages') && parentLeaf.childItems.length > 0) {
        parentLeaf.childItems = new Shuffle(parentLeaf.childItems, page.get('decision.decisionUser.id'));
      }
      tree.childItems.push(parentLeaf);
    } else {
      tree.childItems.push(this.newLeaf(page));
    }
    return tree;
  },

  orderedPages: Ember.computed('pageTree.buildTime', function() {
    let pageForTree = function(tree) {
      return tree.page;
    };

    let flatten = function(tree, collection) {
      if(!tree['childItems'] || tree['childItems'].length === 0) {
        return;
      }
      for(let i = 0; i < tree['childItems'].length; i++) {
        let child = tree['childItems'][i];
        let page = pageForTree(child);
        collection.push(page);
        flatten(child, collection);
      }
    };

    let ordered = [];
    flatten(this.get('pageTree'), ordered);

    ordered = ordered.filter(function(page) {
      return (page && page.get('linkable') && page.get('valid'));
    });

    return ordered;
  }),

  firstPage: Ember.computed('orderedPages.[]', function() {
    return this.get('orderedPages.firstObject');
  }),

  indexForPage(page) {
    let pageIds = this.get('orderedPages').mapBy('id');
    return pageIds.indexOf(page.get('id'));
  },

  isCurrentPage(page) {
    return this.get('currentPage.id') === page.get('id');
  },

  currentPageId: Ember.computed('currentPage.id', function() {
    return this.get('currentPage.id');
  }),

  currentPageIndex: Ember.computed('orderedPages.[]', 'currentPage.id', function() {
    this.get('orderedPages'); // observe
    return this.indexForPage(this.get('currentPage'));
  }),

  previousPage: Ember.computed('currentPageIndex', function() {
    this.get('currentPageIndex');
    return this._pageByOffset(-1);
  }),
  nextPage: Ember.computed('currentPageIndex', function() {
    this.get('currentPageIndex');
    return this._pageByOffset(1);
  }),

  nextPageDisabled: Ember.computed('nextPage.id', 'progressChanged', 'balanceBlocksNavigation',
    function() {
      this.get('progressChanged'); // observe
      this.get('balanceBlocksNavigation'); // observe
      let nextPage = this.get('nextPage');

      if(Em.isEmpty(nextPage)) {
        return true;
      }

      return this.pageIsBlocked(nextPage);
    }),
  currentPageComplete: Ember.computed('progressChanged', 'currentPage.id', function() {
    return this.progressCompleteFor(this.get('currentPage'), 'permissions');
  }),
  sequenceBlockingPages: Ember.computed.filterBy("orderedPages", "blocksNextPages", true),

  sequenceBlockedAtIndex: Ember.computed('progressChanged', function() {
    this.get('progressChanged'); //watch
    let orderedPages = this.get('orderedPages');
    if(!orderedPages) {
      return false;
    }

    let sequenceBlockingPages = this.get('sequenceBlockingPages');
    if(!sequenceBlockingPages) {
      return false;
    }

    let sequenceBlockingIds = sequenceBlockingPages.mapBy('id');
    let that = this;

    let firstBlocked = orderedPages.find(function(page) {
      if(!sequenceBlockingIds.contains(page.id)) {
        return false;
      }
      return !that.progressCompleteFor(page, 'permissions');
    });

    if(!firstBlocked) {
      return false;
    }

    return this.indexForPage(firstBlocked);

  }),
  lastPageInRandomizeSection: Ember.computed('progressChanged', function() {
    this.get('progressChanged'); //watch
    let orderedPages = this.get('orderedPages');
    if(!orderedPages) {
      return null;
    }

    let getAllPagesWithRandomizeOn = orderedPages.filter((x) => x.get('parent.randomizeNestedPages') && x.get('parent.nestedPagesPermissions') === 'require_section_completed');
    if(!getAllPagesWithRandomizeOn) {
      return null;
    }
    return getAllPagesWithRandomizeOn[getAllPagesWithRandomizeOn.length - 1];
  }),
  pageIsBlocked(page) {
    let index = this.indexForPage(page);
    let previousPageIndex = index - 1;
    let previousPage = false;
    let orderedPages = this.get('orderedPages');

    if(!index || index < 0) {
      return false;
    }

    if(!orderedPages) {
      return false;
    }

    if(previousPageIndex !== -1 && previousPageIndex in orderedPages) {
      previousPage = orderedPages[previousPageIndex];
    }

    // If we have randomize pages on we override permissions
    if(page.get('parent.randomizeNestedPages')) {
      if(!Ember.isEmpty(page.get('parent.nestedPagesPermissions')) && page.get('parent.nestedPagesPermissions')) {
        if(page.get('parent.nestedPagesPermissions') === 'required_questions_only') {
          if(['survey-page'].contains(previousPage.get('template'))) {
            return !this.progressCompleteFor(previousPage, 'permissions');
          }
          // return false;
        }
      }
    }

    let sequenceBlock = this.get('sequenceBlockedAtIndex');
    if(!Em.isEmpty(sequenceBlock) && sequenceBlock !== false && (sequenceBlock < index)) {
      return true;
    }

    if(!previousPage) {
      return false;
    }

    return this._isCurrentlyBlocked(page, previousPage);
  },
  _isCurrentlyBlocked: function(page, previousPage) {
    // if we require completion at all, block the next page on pages with inputs
    // if (this.get('completionPagesAreBlocked') && !this.progressCompleteFor(previousPage, 'progress')) {
    //   return true;
    // }

    if(page.get('completionPage') && this.get('completionPagesAreBlocked')) {
      return true;
    }

    if(page.get('blockedPage') && this.get('blockedPagesAreBlocked')) {
      return true;
    }

    if(page.get('requiresBalance') && this.get('balanceBlocksNavigation')) {
      return true;
    }

    if(['survey-page', 'pledge-page', 'submit-page'].contains(previousPage.get('template'))) {
      return !this.progressCompleteFor(previousPage, 'permissions');
    }

    if(previousPage.get('notRequired')) {
      return false;
    }

    return !this.progressCompleteFor(previousPage, 'permissions');
  },

  _pageByOffset(offset) {
    let index = this.get('currentPageIndex');
    if(index === null || index === -1) {
      return null;
    }

    let orderedPages = this.get('orderedPages');
    if(!orderedPages) {
      return null;
    }

    let newIndex = index + offset;

    if(newIndex in orderedPages) {
      return orderedPages[newIndex];
    }
    return null;
  },
  goToPage(page) {
    this.get('routing').transitionTo('page', page, {queryParams: this.get('queryParams')});
  },
  // in addition to direct calls, these are triggered when using menu as the target in an hbs file
  goToNextPage() {
    if(!this.get('nextPageDisabled')) {
      this.goToPage(this.get('nextPage'));
    }
  },
  goToPreviousPage() {
    this.goToPage(this.get('previousPage'));
  },
  openClientCommentModal() {
    const clientCommentService = this.get('clientCommentService');

    clientCommentService.openClientCommentModal();
  },
  sendToMyProfile() {
    this.toggleDrawer('hide');
    this.get('routing').transitionTo('profile.edit');
  },

});
