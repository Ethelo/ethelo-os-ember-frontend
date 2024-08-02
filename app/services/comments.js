import Modals from "frontend/mixins/modals";

export default Ember.Service.extend(Modals, {
  analytics: Ember.inject.service(),
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  registry: Ember.inject.service(),
  configuredMarks: Ember.computed.alias('registry.decision.commentMarks'),
  hasMark: function(mark) {
    return this.get('configuredMarks').contains(mark);
  },
  hasCommentLikes: Ember.computed("configuredMarks", function(){
    return this.hasMark('like');
  }),
  hasCommentFlags: Ember.computed("configuredMarks", function(){
    return this.hasMark('flag');
  }),
  targetId(target){
    if (Em.isNone(target) || Em.isEmpty(target)) {
      return '';
    }
    return target.get('commentType').dasherize() + target.get('id');
  },
  pairId(target, target2){
    return this.targetId(target) + '-' + this.targetId(target2);
  },
  prefixedId(prefix, target, target2){
    return prefix + '-' + this.pairId(target, target2);
  },
  updateCommentSummary(){
    this.get('registry').loadCommentSummary();
  },
  reloadComment(comment){
    return this._loadComments(comment.get('target'), comment.get('target2'), null, null, comment);
  },
  loadNewestComments(target, target2){
    return this._loadComments(target, target2, null, null, null);
  },
  loadCommentsBefore(target, target2, date){
    return this._loadComments(target, target2, date, null, null);
  },
  loadCommentsAfter(target, target2, date){
    this.updateCommentSummary();
    return this._loadComments(target, target2, null, date, null);
  },
  _loadComments(target, target2, before, after, comment){
    let query = {
      target_type: target.get('commentType'),
      target_id: target.get('id'),
      target2_type: target2 ? target2.get('commentType') : null,
      target2_id: target2 ? target2.get('id') : null,
      comment_id: Em.isEmpty(comment) ? null : comment.get('id'),
      before: before,
      after: after
    };
    return this.get('store').query('comment', query);
  },
  markFor(comment, kind){
    let currentUserCommentMarks = this.get('currentUserCommentMarks');
    let existing = currentUserCommentMarks.find(function(commentMark) {
      return commentMark.get('comment.id') === comment.get('id') && commentMark.get('kind') === kind;
    });

    // unloaded records can lead to weird results, so filter them out
    if (Em.isEmpty(existing) || Em.isEmpty(existing.id) || existing.id==="undefined" || existing.id==="null") {
      return null;
    }
    return existing;
  },
  delayedReloadComment(comment){
    let loadFunc = function() {
      this.reloadComment(comment);
    }.bind(this);

    Ember.run.later(loadFunc, 1 * 1000); // 1 sec
  },
  allCommentMarks: Ember.computed(function() {
    return this.get('store').peekAll('comment-mark');
  }),
  currentUserCommentMarks: Ember.computed('allCommentMarks.@each.updatedAt', 'registry.decisionUser.id', function() {
    let decisionUserId = this.get('registry.decisionUser.id');
    return this.get('allCommentMarks').filter(function(commentMark) {
      //observing in case it makes a difference for observers
      commentMark.get('updatedAt');
      return commentMark.get('decisionUser.id') === decisionUserId;
    });
  }),
  postComment(data) {
    let analytics = this.get('analytics');
    let newComment = this.get('store').createRecord('comment', data);
    let saved = newComment.save().then(function() {
      analytics.trackEvent('Comment', 'Post', data['target_type']);
    });
    this.updateCommentSummary();
    return saved;
  },
  unloadCommentMark(comment, kind){
    let existing = this.markFor(comment, kind);
    if (existing && !Em.isEmpty(existing.id)) {
      existing.unloadRecord();
    }
  },
  unloadCommentFlags(comment){
    let existing = this.get('currentUserCommentMarks');
    existing = existing.filter(function(commentMark) {
      return commentMark.get('comment.id') === comment.get('id');
    });
    existing.forEach(function(mark) {
      mark.unloadRecord();
    });
  },
  postCommentMark(comment, kind, value) {
    if ( this.promptBeforeCommenting()){
      return;
    }

    this.unloadCommentMark(comment, kind);
    let service = this;
    let data = {
      comment: comment,
      kind: kind,
      value: value,
      decisionUser: this.get('registry.decisionUser'),
      updatedAt: new Date() // faster placement
    };

    let analytics = this.get('analytics');
    let newMark = this.get('store').createRecord('comment-mark', data);
    let saved = newMark.save().then(function() {
      analytics.trackEvent('Comment Mark', kind, comment.get('id'));
      service.reloadComment(comment);
    });
    this.delayedReloadComment(comment);
    return saved;
  },
});
