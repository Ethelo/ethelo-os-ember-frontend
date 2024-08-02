import Registry from 'frontend/mixins/registry';

export default Ember.Component.extend(Registry,{
  classNames: ['list-replies', 'comment-list'],
  viewAllReplies: false,
  numRepliesInitiallyVisible: 2,

  visibleReplies: Ember.computed(
    'replies.[]',
    'replies.@each.createdAt',
    'viewAllReplies',
    'numRepliesInitiallyVisible',
    function() {
      let allReplies = this.get('replies');
      if (!allReplies) {
        return null;
      }

      if (this.get('orderCommentsByLikes')) {
        allReplies = allReplies.sortBy('likeCount').reverse();
      } else {
        allReplies = allReplies.sortBy('createdAt').reverse();

      }

      if (this.get('viewAllReplies') || (allReplies.length <= this.get('numRepliesInitiallyVisible'))) {
        return allReplies;
      }

      return allReplies.slice(allReplies.length - this.get('numRepliesInitiallyVisible'), allReplies.length);
    }
  ),

  canViewMore: Ember.computed('replies.[]', 'visibleReplies', function() {
    let numReplies = this.get('replies.length');
    if (numReplies == null) {
      return false;
    }
    return numReplies > this.get('visibleReplies.length');
  }),

  itemsToHide: Ember.computed('replies.length','viewAllReplies', function() {
    if(this.get('replies.length') < 1){
      return false;
    }
    return this.get('viewAllReplies');
  }),

  actions: {
    viewMoreReplies() {
      this.set('viewAllReplies', true);
    },
    hideAllReplies() {
      this.set('viewAllReplies', false);
      this.set('numRepliesInitiallyVisible', 0);
    }
  }
});
