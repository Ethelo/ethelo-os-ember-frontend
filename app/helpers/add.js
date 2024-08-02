export default Ember.Helper.helper(function([a, b]) {
  if (Ember.isNone(a) || Ember.isNone(b)) {
    return '';
  }
  return parseInt(a) + parseInt(b);
});
