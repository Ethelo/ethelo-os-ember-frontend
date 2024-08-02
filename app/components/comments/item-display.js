import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  commentService: Ember.inject.service('comments'),

  replying: false,
  editing: false,

  tagName: 'li',
  classNames: ['list-group-item', 'comment-item-container'],
  canUpdate: Ember.computed(
    'registry.decisionUser.id',
    'registry.decisionUser.canModerate',
    'comment.decisionUser.id',
    function() {
      let currentUserId = this.get('registry.decisionUser.id'),
        commenterId = this.get('comment.decisionUser.id'),
        canModerate = this.get('registry.decisionUser.canModerate');

      return (currentUserId === commenterId) || canModerate;
    }),
  allowReplies: Ember.computed.or('canReply', 'commentsEnabled'),

  deleteConfirmation: Ember.computed(function() {
    return this.get('i18n').t('comments.delete_confirmation');
  }),
  manyReplies: Ember.computed('comment.replies[]', 'comments.@each.id', function() {
    return this.get('comment.replies.length') > 5;
  }),
  currentUserHasLiked: Ember.computed(
    'commentService.currentUserCommentMarks.@each.updatedAt',
    'comment.id',
    'registry.decisionUser.id',
    function() {
      this.get('commentService.currentUserCommentMarks');
      this.get('comment.id');
      this.get('registry.decisionUser.id');// observe

      let commentService = this.get('commentService');
      let existing = commentService.markFor(this.get('comment'), 'like');
      return !!existing;
    }),
  currentUserHasFlagged: Ember.computed(
    'commentService.currentUserCommentMarks.@each.updatedAt',
    'comment.id',
    'registry.decisionUser.id',
    function() {
      this.get('commentService.currentUserCommentMarks');
      this.get('comment.id');
      this.get('registry.decisionUser.id');// observe

      let commentService = this.get('commentService');
      let existing = commentService.markFor(this.get('comment'), 'flag');
      return !!existing;
    }),
  createMark(kind, value){
    let commentService = this.get('commentService');
    commentService.postCommentMark(this.get('comment'), kind, value);
  },
  actions: {
    like() {
      this.createMark('like', true);
    },
    removeLike() {
      this.createMark('like', false);
    },

    flag() {
      this.createMark('flag', true);
    },
    unflag() {
      this.createMark('flag', false);
    },
    clearFlags() {
      let commentService = this.get('commentService');
      commentService.unloadCommentFlags(this.get('comment'));
      this.createMark('all_flags', false);
    },

    scrollToReply() {
      this.set('replying', true);
      let form = $("#" + this.get('comment.commentId  .new-comment'));
      $('html,body').animate({
        scrollTop: form.offset().top - form.height()
      });
    },

    addReply() {
      this.set('replying', true);
    },

    replyComplete() {
      this.set('replying', false);
    },

    edit() {
      this.set('editing', true);
    },

    editingComplete() {
      this.set('editing', false);
    },

    remove() {
      if (confirm(this.get('deleteConfirmation'))) {
        let comment = this.get('comment');
        comment.deleteRecord();
        comment.save();

        this.destroy();
      }
    },
  }
});
