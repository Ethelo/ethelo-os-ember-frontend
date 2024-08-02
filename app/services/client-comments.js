export default Ember.Service.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  registry: Ember.inject.service(),
  targetId(target){
    if (Em.isNone(target) || Em.isEmpty(target)) {
      return '';
    }
    return target.get('commentType').dasherize() + target.get('id');
  },
  prefixedId(prefix, target){
    return prefix + '-' + this.targetId(target);
  },
  postComment(data) {
    let newClientComment = this.get('store').createRecord('client-comment', data);
    let saved = newClientComment.save();

    return saved;
  },

  adjustClientCommentModal() {
    let client_comment_modal = $("#clientcommentsmodalwrapper");
    if (client_comment_modal.length > 0) {
      client_comment_modal.modal('handleUpdate');
    }
  },
  openClientCommentModal() {
    let client_comment_modal = $("#clientcommentsmodalwrapper");
    if (client_comment_modal.length > 0) {
      client_comment_modal.modal('show');
    }
  },
  loadClientComments(target){
    let query = {
      target_type: target.get('commentType'),
      target_id: target.get('id'),
    };
    return this.get('store').query('client-comment', query);
  },
});
