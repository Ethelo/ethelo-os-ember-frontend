

export default Ember.Helper.helper(function([date, format]) {
  if (!date) {
    return null;
  }
  return moment(date).format(format);
});
