import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  store: Ember.inject.service(),
  commentService: Ember.inject.service('comments'),
  classNames: ['comment-list'],
  commentListId: Ember.computed('target.id', 'target.commentType', 'target2.id', 'target2.commentType', function() {
    this.get('target.commentType');
    this.get('target.id');
    this.get('target2.commentType');
    this.get('target2.id');
    //observe
    let service = this.get('commentService');

    let id = service.prefixedId('comment', this.get('target'), this.get('target2'));
    return id;
  }),
  allowNewComments: Ember.computed.or('includeCommentForm', 'commentsEnabled'),

  hasOlder: Ember.computed.gt('olderCount', 1),
  perPage: Ember.computed.alias('registry.decision.commentsPerPage'),
  nextPageCount: 10,
  firstPageCount: Ember.computed.alias('registry.decision.commentsPerPreview'),
  viewCount: 2,
  peopleCount: null,
  isCommentsVisible: false,
  init() {
    this.set('viewCount', this.get('firstPageCount'));
    this.set('nextPageCount', this.get('perPage'));
    this._super();
  },
  showNext: Ember.computed('olderCount', 'nextPageCount', function() {
    let older = this.get('olderCount');
    let nextPageCount = this.get('nextPageCount');
    return older > nextPageCount ? nextPageCount : older;
  }),
  olderCount: Ember.computed('totalCount', 'visibleCount', function() {
    let total = this.get('totalCount');
    let visible = this.get('visibleCount');
    if (!total) {
      return 0;
    } else if (!visible) {
      return total;
    } else {
      return total - visible;
    }
  }),
  latestLoad: null,
  isLoading: Ember.computed('loader', 'loader.isPending', 'items.isUpdating', 'items', 'items.@each.id', function() {
    let items = this.get('items');
    let loader = this.get('loader');
    let isLoading = false;
    if (items === null || typeof( items ) === 'undefined') {
      isLoading = true;
    } else {

      let service = this.get('commentService');
      let id = service.pairId(this.get('target'), this.get('target2'));
      id = id + '-' + this.get('registry.decisionUser.id');

      isLoading = loader.get('isPending') || items.get('isUpdating');
      this.set('commentSummary', this.get('store').peekRecord('comment-summary', id));
    }
    return isLoading;
  }),
  loadOlderItems(){
    let isLoading = this.get('isLoading');
    let hasOlder = this.get('hasOlder');
    if (!isLoading && hasOlder) {
      let date = this.get('items.lastObject.createdAt');
      let loader = this.get('commentService').loadCommentsBefore(this.get('target'), this.get('target2'), date);
      this.set('loader', loader);
    }
  },

  visibleCount: Ember.computed.alias('visibleItems.length'),
  totalCount: Ember.computed('commentSummary.comments', 'items', 'items.@each.id',
    function() {
      let summary_count = this.get('commentSummary.comments') || 0;
      let loaded_count = this.get('items.length') || 0;
      // if decisionUser isn't an admin(canSeeAdmin: false) then count only loaded comments
      if (!this.get('registry.decisionUser.canSeeAdmin')) {
        return loaded_count;
      }

      if (summary_count > loaded_count) {
        return summary_count;
      } else {
        return loaded_count;
      }
    }
  ),
  loadNewComments: function() {
    let latestLoad = this.get('latestLoad');
    let latest = this.get('commentSummary.latestComment');
    if (latestLoad < latest) {
      this.set('latestLoad', new Date());
      this.get('commentService').loadCommentsAfter(this.get('target'), this.get('target2'), latestLoad);
    }
  }.observes('commentSummary.latestComment', 'latestLoad'),
  didInsertElement() {
    this.updateFilter();
  },
  targetChanged: Ember.observer('target.id', 'target.commentType', 'target2.id', 'target2.commentType', function() {
    this.get('target.id');
    this.get('target.commentType'); //observe
    this.get('target2.id');
    this.get('target2.commentType'); //observe
    this.updateFilter();
  }),
  updateFilter: function() {
    this.get('commentService').updateCommentSummary();

    Ember.run.once(this, function() {
      this.set('items', null);
      this.set('latestLoad', new Date());
      let component = this;

      let loader = this.get('commentService').loadNewestComments(this.get('target'), this.get('target2'));
      this.set('loader', loader);
      let filtered = this.get('store').filter('comment', this.filter());
      filtered.then(function(loaded) {
        component.set('items', loaded);
      }); // store the filter not the promise
      this.set('items', filtered);
    });
  },

  filter: function() {
    let desiredTargetId = this.get('target.id');
    let desiredTargetType = this.get('target.commentType');
    let desiredTarget2Id = this.get('target2.id');
    if (Em.isNone(desiredTarget2Id)) {
      desiredTarget2Id = null;
    }
    let desiredTarget2Type = this.get('target2.commentType');
    if (Em.isNone(desiredTarget2Type)) {
      desiredTarget2Type = null;
    }

    return function(comment) {
      let commentTargetId = comment.get('target.id');
      let commentTargetType = comment.get('target.commentType');
      let commentTarget2Id = comment.get('target2.id');
      if (Em.isNone(commentTarget2Id)) {
        commentTarget2Id = null;
      }
      let commentTarget2Type = comment.get('target2.commentType');
      if (Em.isNone(commentTarget2Type)) {
        commentTarget2Type = null;
      }
      return desiredTargetId === commentTargetId &&
        desiredTargetType === commentTargetType &&
        desiredTarget2Id === commentTarget2Id &&
        desiredTarget2Type === commentTarget2Type &&
        Em.isEmpty(comment.get('parent'));
    };
  },
  hasMany: Ember.computed('visibleItems', function() {
    return this.get('visibleItems.length') > 5;
  }),
  visibleItems: Ember.computed(
    'items',
    'items.@each.id',
    'isLoading',
    'viewCount',
    function() {
      this.get('isLoading'); // observe

      let fullList = this.get('items');
      if (Em.isEmpty(fullList)) {
        return null;
      }

      if (this.get('orderCommentsByLikes')) {
        fullList = fullList.sortBy('likeCount').reverse();
      } else {
        fullList = fullList.sortBy('createdAt').reverse();

      }

      return fullList.slice(0, this.get('viewCount'));
    }
  ),

  canViewMore: Ember.computed('items.@each.id', 'hasOlder', 'visibleItems', function() {
    if (this.get('hasOlder')) {
      return true;
    }
    let totalLoaded = this.get('items.length');
    if (totalLoaded == null) {
      return false;
    }

    return totalLoaded > this.get('visibleItems.length');
  }),

  itemsToHide: Ember.computed('items.length', 'viewCount', function() {
    let length = this.get('items.length');
    if (Em.isEmpty(length) || length < 1) {
      return false;
    }
    return this.get('viewCount') > 0;
  }),

  actions: {
    toggleVisible(){
      this.toggleProperty('isCommentsVisible');
    },
    viewMore() {
      let current = this.get('viewCount');
      if (current < 1) {
        this.set('viewCount', this.get('firstPageCount'));
      } else {
        this.set('viewCount', this.get('viewCount') + this.get('perPage'));
      }
      this.set('nextPageCount', this.get('perPage'));

      this.loadOlderItems();
    },

    hideAll() {
      this.set('viewCount', 0);
      this.set('nextPageCount', this.get('firstPageCount'));
    },
    scrollToForm() {
      let form = $("#" + this.get('commentListId') + ' .new-comment');
      $('html,body').animate({
        scrollTop: form.offset().top - (form.height() / 2)
      });
    },
  }

});
