import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry, {
  clientCommentService: Ember.inject.service('client-comments'),

  replying: false,
  editing: false,

  tagName: 'li',
  classNames: ['list-group-item', 'comment-item-container'],
  canUpdate: Ember.computed(
    'registry.decisionUser.id',
    'registry.decisionUser.canSeeAll',
    'clientComment.decisionUser.id',
    function() {
      let currentUserId = this.get('registry.decisionUser.id'),
        commenterId = this.get('clientComment.decisionUser.id'),
        canSeeAll = this.get('registry.decisionUser.canSeeAll');

      return (currentUserId === commenterId) || canSeeAll;
    }),
  canSeeAll: Ember.computed(
    'registry.decisionUser.canSeeAll',
    function() {
      return this.get('registry.decisionUser.canSeeAll');
    }),
  deleteConfirmation: Ember.computed(function() {
    return this.get('i18n').t('comments.delete_confirmation');
  }),

  markCompleteConfirmation: Ember.computed(function() {
    return this.get('i18n').t('client_comment.mark_complete_confirmation');
  }),

  actions: {
    complete() {
      if(confirm(this.get('markCompleteConfirmation'))) {
        let clientComment = this.get('clientComment');
        clientComment.set('status', 'complete');
        clientComment.save();

        this.destroy();
      }
    },

    edit() {
      this.set('editing', true);
    },

    editingComplete() {
      this.set('editing', false);
    },

    remove() {
      if (confirm(this.get('deleteConfirmation'))) {
        let clientComment = this.get('clientComment');
        clientComment.deleteRecord();
        clientComment.save();

        this.destroy();
      }
    },
  }
});
