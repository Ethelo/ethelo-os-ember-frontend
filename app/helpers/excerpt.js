export default Ember.Helper.helper(function([text, limit]) {
  return `${text.substring(0, limit)}...`;
});
