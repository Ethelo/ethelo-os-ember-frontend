import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  clientCommentService: Ember.inject.service('client-comments'),
  classNames: ['comment-list'],
  clientCommentListId: Ember.computed('target.id', 'target.commentType', function() {
    this.get('target.commentType');
    this.get('target.id');
    //observe
    let service = this.get('clientCommentService');

    let id = service.prefixedId('client-comment', this.get('target'));
    return id;
  }),

  didInsertElement() {
    this.updateFilter();
  },

  targetChanged: Ember.observer('target.id', 'target.commentType', function() {
    this.get('target.id');
    this.get('target.commentType'); //observe

    this.updateFilter();
  }),

  updateFilter: function() {
    Ember.run.once(this, function() {
      this.set('items', null);

      let component = this;

	    let service = this.get('clientCommentService');
      let loader = service.loadClientComments(this.get('target'));
      this.set('loader', loader);

      let filtered = this.get('store').filter('clientComment', this.filter());

      filtered.then(function(loaded) {
        component.set('items', loaded);
      }); // store the filter not the promise
      this.set('items', filtered);
    });
  },

  //For future use
  filter: function() {
    let desiredTargetId = this.get('target.id');
    let desiredTargetType = this.get('target.commentType');

    return function(clientComment) {
      let commentTargetId = clientComment.get('target.id');
      let commentTargetType = clientComment.get('target.commentType');

      return desiredTargetId === commentTargetId &&
        desiredTargetType === commentTargetType;
    };
  },

  isLoading: Ember.computed('loader', 'loader.isPending', 'items.isUpdating', 'items', 'items.@each.id', function() {
    let items = this.get('items');
    let loader = this.get('loader');

    let isLoading = false;
    if (items === null || typeof( items ) === 'undefined') {
      isLoading = true;
    } else {
      isLoading = loader.get('isPending') || items.get('isUpdating');
    }
    return isLoading;
  }),
  visibleItems: Ember.computed(
    'items',
    'items.@each.id',
    'isLoading',
    function() {
      this.get('isLoading'); // observe

      let fullList = this.get('items');
      if (Em.isEmpty(fullList)) {
        return null;
      }

      fullList = fullList.sortBy('createdAt').reverse();

      return fullList;
    }
  ),
  actions: {
    scrollToForm() {
      let form = $("#" + this.get('clientCommentListId') + ' .new-comment');
      $('#clientcommentsmodalwrapper .modal-body').animate({
        scrollTop: form.offset().top - (form.height() / 2)
      });
    }
  }

});
